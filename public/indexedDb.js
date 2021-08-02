function checkForIndexedDb() {
  if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
    return false;
  }
  return true;
}


// create new budget database request
const request = window.indexedDB.open('BudgetDB', 1);
let db, tx, store, budgetVers;

request.onupgradeneeded = function(e) {
  const db = request.result;
  db.createObjectStore('BudgetStore', { keyPath: "_id", autoIncrement: true });
};

request.onerror = function(e) {
  console.log("There was an error");
};


function checkDatabase(){
  request.onsuccess = function(e) {
    db = request.result;
    tx = db.transaction('BudgetStore', "readwrite");
    store = tx.objectStore('BudgetStore');
    const all = store.getAll();

    db.onerror = function(e) {
      console.log("error");
    };
    all.onsuccess = function() {
      if (all.result.length > 0) {
        fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(all.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
        })
        .then((response) => response.json())
        .then((res) => {
          // If our returned response is not empty
          if (res.length !== 0) {
            // Open another transaction to BudgetStore with the ability to read and write
            tx = db.transaction(['BudgetStore'], 'readwrite');

            // Assign the current store to a variable
            const currentStore = tx.objectStore('BudgetStore');

            // Clear existing entries because our bulk add was successful
            currentStore.clear();
            console.log('Clearing store 🧹');
          }
        });
      };
    }
  }
}

request.onsuccess = function (e) {
  console.log('success');
  db = request.result;

  // Check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log('Save record invoked');
  // Create a transaction on the BudgetStore db with readwrite access
  const tx = db.transaction(['BudgetStore'], 'readwrite');

  // Access your BudgetStore object store
  const store = tx.objectStore('BudgetStore');

  // Add record to your store with add method.
  store.add(record);
};

window.addEventListener('online', checkDatabase);