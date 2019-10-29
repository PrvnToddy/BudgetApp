//////////////////////////////////////////////////////////Budget Controller/////////////////////////////////////////
let budgetController = (function() {
  let Expanses = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expanses.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expanses.prototype.getPercentage = function() {
    return this.percentage;
  };

  let Incomes = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // Calculate Total
  let calculateTotal = function(type) {
    let sum = 0;
    data.inputData[type].forEach(element => {
      sum += element.value;
    });
    data.total[type] = sum;
  };

  //data storage
  let data = {
    inputData: {
      exp: [],
      inc: []
    },
    total: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      let newItem, ID;

      // ID creation
      if (data.inputData[type].length > 0) {
        ID = data.inputData[type][data.inputData[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Find type
      if (type === "exp") {
        newItem = new Expanses(ID, des, val);
      } else {
        newItem = new Incomes(ID, des, val);
      }

      data.inputData[type].push(newItem);
      return newItem;
    },
    deleteItem: function(type, id) {
      let ids, index;

      ids = data.inputData[type].map(current => {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.inputData[type].splice(index, 1);
      }
    },
    calculatePercentage: function() {
      data.inputData.exp.forEach(element => {
        element.calcPercentage(data.total.inc);
      });
    },

    getPercentage: function() {
      let allPerc = data.inputData.exp.map(element => {
        return element.getPercentage();
      });
      return allPerc;
    },
    calculateBudget: function() {
      calculateTotal("exp");
      calculateTotal("inc");
      //budget calculation
      data.budget = data.total.inc - data.total.exp;
      //percentage calculation
      if (data.total.inc > 0) {
        data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        percentage: data.percentage
      };
    },
    testing: function() {
      console.log(data);
    }
  };
})();

/////////////////////////////////////////////////////UIController//////////////////////////////////////////////////

let UIController = (function() {
  //Some Code
  let DOMstring;
  DOMstring = {
    type: ".add__type",
    description: ".add__description",
    value: ".add__value",
    button: ".add__btn",
    incomeContainer: ".income__list",
    expansesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expansesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expansesPercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };
  let formatNumber = function(num, type) {
    let numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };
  let nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        getType: document.querySelector(DOMstring.type).value,
        getDescription: document.querySelector(DOMstring.description).value,
        getValue: parseFloat(document.querySelector(DOMstring.value).value)
      };
    },
    addListItem: function(obj, type) {
      let html, newHtml, element;
      if (type === "inc") {
        element = DOMstring.incomeContainer;
        html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">
                        <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div></div></div>`;
      } else if (type === "exp") {
        element = DOMstring.expansesContainer;
        html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>
                        <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>
                        <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div></div></div>`;
      }

      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: function(selectId) {
      let el = document.getElementById(selectId);
      el.parentNode.removeChild(el);
    },
    clearFields: function() {
      let fields, arrFields;
      fields = document.querySelectorAll(
        DOMstring.description + ", " + DOMstring.value
      );
      // console.log(fields);

      arrFields = Array.prototype.slice.call(fields);
      // console.log(arrFields);
      arrFields.forEach(element => {
        element.value = "";
      });
      arrFields[0].focus();
    },
    displayBudget: function(obj) {
      let type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstring.expansesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMstring.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstring.percentageLabel).textContent = 0;
      }
    },
    displayPercentage: function(percentages) {
      let fields = document.querySelectorAll(DOMstring.expansesPercentageLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    displayMonth: function() {
      let now, month, year;
      let months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      now = new Date();
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMstring.dateLabel).textContent =
        months[month] + " " + year;
    },
    changeType: function() {
      let fields = document.querySelectorAll(
        DOMstring.type + "," + DOMstring.description + "," + DOMstring.value
      );

      nodeListForEach(fields, function(e) {
        e.classList.toggle("red-focus");
      });
      document.querySelector(DOMstring.button).classList.toggle("red");
    },
    getDOMstring: function() {
      return DOMstring;
    }
  };
})();

////////////////////////////////////////////////////Main Controller//////////////////////////////////////////////////////

let controller = (function(budgetCtrl, UICtrl) {
  let control = function() {
    let DOM = UICtrl.getDOMstring();
    document.querySelector(DOM.button).addEventListener("click", eventControl);
    document.addEventListener("keypress", function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        eventControl();
      }
    });
    document.querySelector(DOM.container).addEventListener("click", deleteItem);
    document
      .querySelector(DOM.type)
      .addEventListener("change", UICtrl.changeType);
  };

  let updateBudget = function() {
    //calculate budget
    budgetCtrl.calculateBudget();

    let budget = budgetCtrl.getBudget();

    UICtrl.displayBudget(budget);
  };

  let updatePercentages = function() {
    budgetCtrl.calculatePercentage();
    let percentage = budgetCtrl.getPercentage();
    UICtrl.displayPercentage(percentage);
  };

  let eventControl = function() {
    // 1. Get Input from input Field
    let input = UICtrl.getInput();

    if (
      input.getDescription !== "" &&
      !isNaN(input.getValue) &&
      input.getValue > 0
    ) {
      //2. store in budget
      let newItem = budgetCtrl.addItem(
        input.getType,
        input.getDescription,
        input.getValue
      );
      // console.log(newItem);
      //3. visible in ui
      UICtrl.addListItem(newItem, input.getType);
      //4. clearFields
      UICtrl.clearFields();
      //5. Update Budget
      updateBudget();
      //6. Update Percentages
      updatePercentages();
    }
  };
  let deleteItem = function(e) {
    let itemId, splitId, type, ID;
    itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemId) {
      splitId = itemId.split("-");
      type = splitId[0];
      ID = parseInt(splitId[1]);
      //delete item from data structure
      budgetCtrl.deleteItem(type, ID);
      // delete ui id
      UICtrl.deleteListItem(itemId);
      // update the budget
      updateBudget();
      // Update Percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("Application Started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });

      control();
    }
  };
})(budgetController, UIController);
controller.init();
