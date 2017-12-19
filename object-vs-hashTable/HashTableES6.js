/*
  https://gist.github.com/alexhawkins/f6329420f40e5cafa0a4
 */

function defaultCompare(a, b) {
  return a === b
}

function defaultHashFunc(key, max) {
  let hash = 0
  for (const letter of key) {
    hash = (hash << 5) + letter.charCodeAt(0)
    hash = (hash & hash) % max
  }
  return hash
}

function reduceFlatten(resultArr, item) {
  resultArr.push(...item)
  return resultArr
}

class HashTable {
  constructor({ limit, compare, hashFunc }) {
    this._storage = []
    this._count = 0
    this._limit = limit || 8
    this._compare = compare || defaultCompare
    this._hashFunc = hashFunc || defaultHashFunc
  }

  insert(key, value) {
    //create an index for our storage location by passing it through our hashing function
    const index = this._hashFunc(key, this._limit)
    //retrieve the bucket at this particular index in our storage, if one exists
    //[[ [k,v], [k,v], [k,v] ] , [ [k,v], [k,v] ]  [ [k,v] ] ]
    var bucket = this._storage[index]
    //does a bucket exist or do we get undefined when trying to retrieve said index?
    if (!bucket) {
      //create the bucket
      var bucket = []
      //insert the bucket into our hashTable
      this._storage[index] = bucket
    }

    let override = false

    //now iterate through our bucket to see if there are any conflicting
    //key value pairs within our bucket. If there are any, override them.
    for (const tuple of bucket) {
      if (this._compare(tuple[0], key)) {
        //overide value stored at this key
        tuple[1] = value
        override = true
      }
    }

    if (!override) {
      //create a new tuple in our bucket
      //note that this could either be the new empty bucket we created above
      //or a bucket with other tupules with keys that are different than
      //the key of the tuple we are inserting. These tupules are in the same
      //bucket because their keys all equate to the same numeric index when
      //passing through our hash function.
      bucket.push([key, value])
      this._count++
      //now that we've added our new key/val pair to our storage
      //let's check to see if we need to resize our storage
      if (this._count > this._limit * 0.75) {
        this.resize(this._limit * 2)
      }
    }
    return this
  }

  remove(key) {
    const index = this._hashFunc(key, this._limit)
    const bucket = this._storage[index]
    if (!bucket) {
      return null
    }
    //iterate over the bucket
    for (let i = 0; i < bucket.length; i++) {
      const tuple = bucket[i]
      //check to see if key is inside bucket
      if (this._compare(tuple[0], key)) {
        //if it is, get rid of this tuple
        bucket.splice(i, 1)
        this._count--
        if (this._count < this._limit * 0.25) {
          this._resize(this._limit / 2)
        }
        return tuple[1]
      }
    }
  }

  retrieve(key) {
    const index = this._hashFunc(key, this._limit)
    const bucket = this._storage[index]

    if (!bucket) {
      return null
    }

    for (const tuple of bucket) {
      if (this._compare(tuple[0], key)) {
        return tuple[1]
      }
    }

    return null
  }

  hashFunc(str, max) {
    let hash = 0

    for (const letter of str) {
      hash = (hash << 5) + letter.charCodeAt(0)
      hash = (hash & hash) % max
    }

    return hash
  }

  resize(newLimit) {
    const oldStorage = this._storage

    this._limit = newLimit
    this._count = 0
    this._storage = []

    oldStorage.forEach(bucket => {
      if (!bucket) {
        return
      }

      for (const tuple of bucket) {
        this.insert(tuple[0], tuple[1])
      }
    })
  }

  retrieveAll() {
    return this._storage.reduce(flattenReduce, [])
  }
}

module.exports = HashTable
