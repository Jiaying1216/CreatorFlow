import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { firebase } from './config';

const TASK_NAME = 'UPDATE_TASK_STATUS';

TaskManager.defineTask(TASK_NAME, async () => {
    try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const tasksRef = firebase.firestore().collectionGroup('tasks');
        const snapshot = await tasksRef.get();

        snapshot.forEach(async doc => {
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
                await doc.ref.update({ status: newStatus });
            }
        });

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        console.error(error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export const registerBackgroundTask = async () => {
    try {
        await BackgroundFetch.registerTaskAsync(TASK_NAME, {
            minimumInterval: 86400, 
            stopOnTerminate: false,
            startOnBoot: true,
        });
        console.log('Background task registered');
    } catch (err) {
        console.log('Background task failed to register:', err);
    }
};
