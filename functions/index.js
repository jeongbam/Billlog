const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

function linkFor(type, meetingId) {
  if (!meetingId) return "/home";
  switch (type) {
    case "plan_item_added":
      return `/meetings/${meetingId}/pre-log`;
    case "settlement_request":
    case "settlement_done":
    case "receipt_added":
      return `/meetings/${meetingId}/bill-log`;
    case "photo_added":
    case "review_added":
      return `/meetings/${meetingId}/post-log`;
    default:
      return `/meetings/${meetingId}`;
  }
}

exports.sendPushOnNotification = onDocumentCreated(
  "users/{uid}/notifications/{notifId}",
  async (event) => {
    const { uid } = event.params;
    const data = event.data?.data();
    if (!data) return;

    const userSnap = await db.doc(`users/${uid}`).get();
    const tokens = userSnap.data()?.fcmTokens;
    if (!Array.isArray(tokens) || tokens.length === 0) return;

    const url = linkFor(data.type, data.meetingId);

    const response = await messaging.sendEachForMulticast({
      tokens,
      data: {
        title: "Billlog",
        body: data.title,
        url,
      },
      webpush: {
        fcmOptions: {
          link: url,
        },
      },
    });

    const invalidTokens = [];
    response.responses.forEach((r, i) => {
      if (!r.success) {
        const code = r.error?.code;
        if (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        ) {
          invalidTokens.push(tokens[i]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      await db.doc(`users/${uid}`).update({
        fcmTokens: FieldValue.arrayRemove(...invalidTokens),
      });
    }
  },
);
