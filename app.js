//Main Budget Controller
var budgetController = (function(){

    var Expenses = function(id , desciption , value){
        this.id = id;
        this.desciption = desciption;
        this.value = value;
        this.percentage = -1;
    };

    Expenses.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0){
        this.percentage = Math.round((this.value/totalIncome) * 100) ;
        }else{
            this.percentage = -1;
        }
    };
    
    Expenses.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id , desciption , value){
        this.id = id;
        this.desciption = desciption;
        this.value = value;
    };

    var data = {
        allItems : {
            exp :[],
            inc :[]
        },
        totals : {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    }
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum = sum + curr.value;
        });
        data.totals[type] = sum;
    }
    return{
        addItem: function(type , des , val){
            var newItem , ID;
            //create new unique ID
            if(data.allItems[type].length>0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            //cretae new Item
            if(type==='exp'){
                newItem = new Expenses(ID , des , val);
            }else if(type==='inc'){
                newItem = new Income(ID , des ,val);
            }
            //push it into DS
            data.allItems[type].push(newItem);
            //return new element
            return newItem;
        },
        deleteItem : function(type , id){
            var ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        calculateBudget : function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that spent
            if(data.totals.inc>0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentages : function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.totals.inc);
            });
        },

        getPercentages : function(){
            var allPercentages = data.allItems.exp.map(function(etl){
                return etl.getPercentage();
            });
            return allPercentages;
        },

        getBudget : function(){
            return{
                budget : data.budget,
                totalInc: data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            }
        }
    };

})();

//UI Controller
var UIController = (function(){
    
    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer :'.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPerLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
    }

    var formatNumber = function(num , type){
            var numSplit , int , des , type;
            num = Math.abs(num).toFixed(2);
            numSplit = num.split('.');
            int = numSplit[0];
            if(int.length>3){
                int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
            }
            des = numSplit[1];
            return (type==='exp' ? '-':'+') + ' ' + int + '.'+ des;
        };    
    return{
        getInput : function(){
            return{
                type : document.querySelector(DOMStrings.inputType).value,
                desciption : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }  
        },
        addListItem : function(obj , type){
            var html , newHtml , element;
            //create HTML string with placeholder
            if(type=== 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMStrings.expensesContainer;
                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //Replace the placeholder test with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.desciption);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value , type));
            //insert the HTML to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteListItem : function(selectorID){
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el);
        },
        clearFields : function(){
            var fields , fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription+','+DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(currentVal , index, array){
                    currentVal.value = "";
            })
            fieldsArr[0].focus();
        },
        displayBudget : function(obj){
            var type ;
            type = obj.budget > 0 ? type = 'inc' : type = 'exp' ;
            document.querySelector(DOMStrings.budgetLabel).textContent =  formatNumber(obj.budget,type);            
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;            
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;     
            if(obj.percentage>0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }           
        },
        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expensesPerLabel);
            var nodeListForEach = function(list , callback){
                for(i=0;i<list.length;i++){
                    callback(list[i],i);  
                }
            }
            nodeListForEach(fields , function(current , index){
                if(percentages[index]>0){
                    current.textContent = percentages[index]+'%';
                }else{
                    current.textContent = '---';
                }    
            })
        },
        displayMonth : function(){
            var monthName = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
            var now = new Date();
            var month = now.getMonth();
            var year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = monthName[month]+' '+year;
        },
        getDOMStrings : function(){
            return DOMStrings
        }  
    }

})();

var controller = (function(budgetCtrl , UICtrl){

    var setUpEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
        if(event.keyCode === 13 || event.which ===13){
            ctrlAddItem();
        };
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    })
    };

    var updateBudget =  function(){
        //calculate the Budget
        budgetCtrl.calculateBudget();
        //return the Budget
        var budget = budgetCtrl.getBudget();
        //Display the Budget to the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        //calculate percentages
        budgetCtrl.calculatePercentages();
        //read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        console.log(percentages);
        //update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        var input , inputItem;
        //get the field input data
        input = UICtrl.getInput();
        if(input.desciption !== "" && ! isNaN(input.value) && input.value >0 ){
        //add the item to budget controller
        newItem = budgetCtrl.addItem(input.type , input.desciption , input.value);
        //add the Item to UI
        UICtrl.addListItem(newItem , input.type);
        //for clearing the input fields
        UICtrl.clearFields();
        //calculate and update Budget
        updateBudget(); 
        //update percentages
        updatePercentages();   
        }
    };

    var ctrlDeleteItem = function(event){
        var itemID , splitId ,type ,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitId =itemID.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);
            //delete the item from the DS
            budgetCtrl.deleteItem(type , ID);
            //delete the item from UI
            UICtrl.deleteListItem(itemID);
            //update the budget
            updateBudget();
            //update percentages
            updatePercentages();
        }
    };

    return{
        init : function(){
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget : 0,
                totalInc: 0,
                totalExp : 0,
                percentage : -1});
            setUpEventListeners();
        }
    };

})(budgetController , UIController);

controller.init();

