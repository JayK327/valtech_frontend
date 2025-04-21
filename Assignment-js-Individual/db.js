const DB_NAME = 'tasksDB';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onerror = () => reject('Error opening database');
    request.onsuccess = (event) => resolve(event.target.result);
  });
}

function saveTaskToDB(task) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(task);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error adding task');
    });
  });
}

function getAllTasks() {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error retrieving tasks');
    });
  });
}

function updateTaskInDB(task) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(task);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject('Error updating task');
    });
  });
}

function deleteTaskFromDB(id) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve('Task deleted');
      request.onerror = () => reject('Error deleting task');
    });
  });
}

export { saveTaskToDB, getAllTasks, updateTaskInDB, deleteTaskFromDB };
