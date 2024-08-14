const { AVLTree } = require('binary-search-tree');

class DateIndex {
  constructor() {
    this.dobTree = new AVLTree();
  }

  insert(dob, id) {
    const dobTimestamp = new Date(dob.split('/').reverse().join('-')).getTime();
    let existingData = this.dobTree.search(dobTimestamp);

    if (existingData.length === 0) {
      this.dobTree.insert(dobTimestamp, new Set([id]));
    } else {
      existingData[0].add(id);
    }
  }

  delete(dob, id) {
    const dobTimestamp = new Date(dob.split('/').reverse().join('-')).getTime();
    let existingData = this.dobTree.search(dobTimestamp);

    if (existingData.length > 0) {
      let idSet = existingData[0];
      idSet.delete(id);

      if (idSet.size === 0) {
        this.dobTree.delete(dobTimestamp);
      }
    }
  }

  searchByAge(age) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const today = new Date(currentYear, now.getMonth(), now.getDate());
    
    const lowerBoundTimestamp = new Date(today.getFullYear() - age - 1, today.getMonth(), today.getDate() + 1).getTime();
    const upperBoundTimestamp = new Date(today.getFullYear() - age, today.getMonth(), today.getDate() - 1, 23, 59, 59).getTime();
    
    let result = new Set();
    this.dobTree.betweenBounds({ $gte: lowerBoundTimestamp, $lte: upperBoundTimestamp }).forEach(data => {
      data.forEach(id => result.add(id));
    });
  
    return result;
  }
  
  
}

module.exports = DateIndex;