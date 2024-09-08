const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.updateTaskStatus = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tasksRef = admin.firestore().collectionGroup('tasks');

    const snapshot = await tasksRef.get();
    snapshot.forEach(doc => {
        const task = doc.data();
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const createdDate = new Date(task.createdDate);
        let newStatus = task.status;

        if (dueDate && dueDate < now) {
            newStatus = 'Overdue';
        } else if (createdDate.toISOString().split('T')[0] !== today) {
            newStatus = 'On-going';
        }

        if (newStatus !== task.status) {
            doc.ref.update({ status: newStatus });
        }
    });

    return null;
});