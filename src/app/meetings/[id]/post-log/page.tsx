"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import RequireAuth from "@/components/RequireAuth";
import { PlusIcon } from "@/components/icons";
import { Avatar, Button } from "@/components/ui";
import {
  addPhoto,
  addReview,
  subscribeMeeting,
  subscribePhotos,
  subscribeReviews,
} from "@/lib/meetings";
import { uploadImage } from "@/lib/storage";
import { useAuthStore } from "@/store/useAuthStore";
import type { Meeting, Photo, Review } from "@/types";

function PostLogContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const fileRef = useRef<HTMLInputElement>(null);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const u1 = subscribeMeeting(id, setMeeting);
    const u2 = subscribePhotos(id, setPhotos);
    const u3 = subscribeReviews(id, setReviews);
    return () => {
      u1();
      u2();
      u3();
    };
  }, [id]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await uploadImage(
        `meetings/${id}/photos/${Date.now()}-${file.name}`,
        file,
      );
      await addPhoto(id, url, user.uid);
    } finally {
      setUploading(false);
    }
  }

  async function handleReview() {
    if (!reviewText.trim() || !user) return;
    setPosting(true);
    try {
      await addReview(id, reviewText.trim(), user.uid, user.nickname);
      setReviewText("");
    } finally {
      setPosting(false);
    }
  }

  if (!meeting) return null;

  return (
    <AppShell backHref={`/meetings/${id}`} title="Post-log">
      <div className="pt-1">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[20px] font-bold text-gray-700 uppercase">
            사진 ({photos.length})
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {photos.map((p) => (
            <img
              key={p.id}
              src={p.url}
              alt=""
              className="aspect-square rounded-xl object-cover"
            />
          ))}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl bg-gray-50 border-[1.5px] border-dashed border-gray-300 flex items-center justify-center text-gray-400"
          >
            <PlusIcon size={24} />
          </button>
        </div>

        <div className="text-[20px] font-bold text-gray-700 uppercase mt-8 mb-2">
          한줄 후기 ({reviews.length})
        </div>
        <div className="flex flex-col gap-2.5 mb-3">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-2 items-start">
              <Avatar nickname={r.nickname} size="sm" />
              <div className="bg-gray-50 rounded-xl px-3 py-2 text-[12.5px] max-w-[80%]">
                {r.text}
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-[16px] text-gray-400 py-2">
              아직 후기가 없어요.
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 border-[1.4px] border-gray-200 rounded-xl px-3.5 py-3 text-[18px] outline-none focus:border-mint-300"
            placeholder="후기를 남겨보세요"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReview()}
          />
          <button
            onClick={handleReview}
            disabled={posting}
            className="bg-mint-300 text-white text-[18px] rounded-xl px-[18px] disabled:opacity-50"
          >
            등록
          </button>
        </div>

        {meeting.status === "active" && meeting.ownerId === user?.uid && (
          <div className="bg-mint-50 border border-mint-100 rounded-xl p-3.5 flex justify-between items-center mb-24">
            <span className="text-[18px] text-gray-700">
              사진과 후기가 다 모였다면
            </span>
            <button
              onClick={() => router.push(`/meetings/${id}/summary`)}
              className="text-[16px] text-white bg-gray-900 rounded-full px-3 py-1"
            >
              모임 종료하기
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-7 pt-2 bg-white">
        <Button
          variant="secondary"
          onClick={() => router.push(`/meetings/${id}`)}
        >
          모임 상세로 돌아가기
        </Button>
      </div>
    </AppShell>
  );
}

export default function PostLogPage() {
  return (
    <RequireAuth>
      <PostLogContent />
    </RequireAuth>
  );
}
