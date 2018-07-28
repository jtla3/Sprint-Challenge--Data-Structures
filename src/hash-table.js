/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
// A special array class that can only store the number of items specified by the `limit` argument
class LimitedArray {
  constructor(limit) {
    // You should not be directly accessing this array from your hash table methods
    // Use the getter and setter methods included in this class to manipulate data in this class
    this.storage = [];
    this.limit = limit;
  }

  checkLimit(index) {
    if (typeof index !== 'number') throw new Error('The supplied index needs to be a number');
    if (this.limit <= index) {
      throw new Error('The supplied index lies out of the array\'s bounds');
    }
  }

  each(cb) {
    for (let i = 0; i < this.storage.length; i++) {
      cb(this.storage[i], i);
    }
  }
  // Use this getter function to fetch elements from this class
  get(index) {
    this.checkLimit(index);
    return this.storage[index];
  }

  get length() {
    return this.storage.length;
  }
  // Use this setter function to add elements to this class
  set(index, value) {
    this.checkLimit(index);
    this.storage[index] = value;
  }
}
/* eslint-disable no-bitwise, operator-assignment */
// This is hash function you'll be using to hash keys
// There's some bit-shifting magic going on here, but essentially, all it is doing is performing the modulo operator
// on the given `str` arg (the key) modded by the limit of the limited array
// This simply ensures that the hash function always returns an index that is within the boundaries of the limited array
const getIndexBelowMax = (str, max) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash;
    hash = Math.abs(hash);
  }
  return hash % max;
};


class Linkedlist {
  constructor(options) {
    this.head = null;
    this.tail = null;
  }

  addtotail(key, value) {
    const newnode = {};
    newnode[key] = value;
    newnode.next = null;
    if (!this.head) {
      this.head = newnode;
      this.tail = newnode;
    } else {
      this.tail.next = newnode;
      this.tail = newnode;
    }
  }
  removehead() {
    if (!this.head) {
      return null;
    }
    const removed = this.head;
    this.head = this.head.next;
    delete removed.next;
    return removed;
  }
}

class HashTable {
  constructor(limit = 8) {
    this.limit = limit;
    this.storage = new LimitedArray(this.limit);
    // Do not modify anything inside of the constructor
  }

  resize() {
    this.limit *= 2;
    const oldStorage = this.storage;
    this.storage = new LimitedArray(this.limit);
    oldStorage.each((bucket) => {
      if (!bucket) return;
      while (!(bucket.head === null)) {
        const removed = bucket.removehead();
        this.insert(Object.entries(removed)[0][0], Object.entries(removed)[0][1]);
      }
    });
  }

  capacityIsFull() {
    let fullCells = 0;
    this.storage.each((bucket) => {
      if (bucket !== undefined) fullCells++;
    });
    return fullCells / this.limit >= 0.75;
  }

  // Adds the given key, value pair to the hash table
  // Fetch the bucket associated with the given key using the getIndexBelowMax function
  // If no bucket has been created for that index, instantiate a new bucket and add the key, value pair to that new bucket
  // If the key already exists in the bucket, the newer value should overwrite the older value associated with that key
  insert(key, value) {
    if (this.capacityIsFull()) this.resize();
    const index = getIndexBelowMax(key.toString(), this.limit);
    const bucket = this.storage.get(index) || new Linkedlist();
    const newbucket = new Linkedlist();
    newbucket.addtotail(key, value);
    while (!(bucket.head === null)) {
      const removed = bucket.removehead();
      if (!(key in removed)) {
        newbucket.addtotail(Object.entries(removed)[0][0], Object.entries(removed)[0][1]);
      }
    }
    this.storage.set(index, newbucket);
  }
  // Removes the key, value pair from the hash table
  // Fetch the bucket associated with the given key using the getIndexBelowMax function
  // Remove the key, value pair from the bucket
  remove(key) {
    const index = getIndexBelowMax(key.toString(), this.limit);
    const bucket = this.storage.get(index);
    if (!bucket) return this;
    const newbucket = new Linkedlist();
    while (!(bucket.head === null)) {
      const removed = bucket.removehead();
      if (!(key in removed)) {
        newbucket.addtotail(Object.entries(removed)[0][0], Object.entries(removed)[0][1]);
      }
    }
    this.storage.set(index, newbucket);
  }
  // Fetches the value associated with the given key from the hash table
  // Fetch the bucket associated with the given key using the getIndexBelowMax function
  // Find the key, value pair inside the bucket and return the value
  retrieve(key) {
    const index = getIndexBelowMax(key.toString(), this.limit);
    const bucket = this.storage.get(index);
    if (!bucket) return undefined;
    const newbucket = new Linkedlist();
    let retrieved;
    while (!(bucket.head === null)) {
      const removed = bucket.removehead();
      if (key in removed) {
        retrieved = removed[key];
      }
      newbucket.addtotail(Object.entries(removed)[0][0], Object.entries(removed)[0][1]);
    }
    this.storage.set(index, newbucket);
    return retrieved;
  }
}

module.exports = HashTable;
