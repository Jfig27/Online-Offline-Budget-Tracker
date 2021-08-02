const request = window.indexedDB.open('BudgetDB', 1);

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
          if (res.length !== 0) {
            tx = db.transaction(['BudgetStore'], 'readwrite');

            const currentStore = tx.objectStore('BudgetStore');

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

  if (navigator.onLine) {
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log('Save record invoked');

  const tx = db.transaction(['BudgetStore'], 'readwrite');

  const store = tx.objectStore('BudgetStore');

  store.add(record);
};

window.addEventListener('online', checkDatabase);