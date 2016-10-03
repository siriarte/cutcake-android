var spentDict ={};
var posBalanceName = [];
var posBalanceMoney = [];
var negBalanceName = [];
var negBalanceMoney = [];
var arrRotate = 0;
var splitTable = [];
var splitIdx = 0;

function addField(){

    // ID del elemento div quitandole la palabra "div_" de delante. Pasi asi poder aumentar el n�mero. Esta parte no es necesaria pero yo la utilizaba ya que cada campo de mi formulario tenia un autosuggest , as� que dejo como seria por si a alguien le hace falta.
    var rows = $("div[id^='p_row_']");
    var clickID;
    var $newClone;
    if(rows.length < 1) {
        //first disable field
        $newClone = $('#p_row').clone(true);
        clickID = 0;
    } else {
        clickID = parseInt(rows.last().attr('id').replace('p_row_',''));
        $newClone = $('#p_row_' + clickID).clone(true);
    }   
    // Genero el nuevo numero id
    var newID = (clickID+1);

    //Le asigno el nuevo numero id
    $newClone.attr("id",'p_row_'+newID);
    
    //remove "disabled"
    $newClone.removeAttr("style");
    
    //Inserto el div clonado y modificado despues del div original
    if(clickID === 0) {
        $newClone.insertAfter($('#p_row'));
    }else{
        $newClone.insertAfter($('#p_row_'+clickID)); 	
        $("[id|='name']").last().val('');
        $("[id|='amount']").last().val('');
    }
  
    if(newID > 2){
        var p_row = "#p_row_" + (newID-2);
        $("#forms").show("slow", function(){
            $("body").scrollTop($(p_row).offset().top);
        });    
    }
    
    var personVal = PERSON + (clickID+1);
    spanVal = '#p_row_'+ (clickID + 1) + ' span';
    $(spanVal).text(personVal);
    
}

function delRow(b) {
    
    var rowID = b.parentElement.parentElement.parentElement.getAttribute('id');
    rowID = parseInt(rowID.replace('p_row_',''));
    $("div[id^='p_row_']").each(function() {
        var id = this.getAttribute('id');
        id = parseInt(id.replace('p_row_',''));
        if(id>rowID){
            var personVal = "Person: " + (id-1);
            spanVal = '#p_row_'+ (id) + ' span';
            $(spanVal).text(personVal);
            this.setAttribute('id','p_row_'+ (id-1));
        }
    });
    
    $(b).parent().parent().parent('div').hide("slow");
    $(b).parent().parent().parent('div').remove();
   
}

function sumAmount() {
    spentDict = {};
    posBalanceName = [];
    posBalanceMoney = [];
    negBalanceName = [];
    negBalanceMoney = [];
    var finishError = false;
    
    $("#logo").hide();
    $("#forms").hide();
    $("#footer").hide();
    
    $("#div_error").empty();
    $("#div_error").append('<p class="lead"> <img src="'+IMG_DIR+'glyphicons-505-alert.png" class="alert_icon"/> '+ERROR_IN_DATA+'</p>');
    $("#div_error").hide();
    $("#result").empty();
    $("#result").hide();
    $('#op_btns').hide("slow");
    
    $("div[id^='p_row_']").each(function() {
         var inputs = $(this).find('input');
         if(typeof variable_here === 'undefined')
         var name = inputs[0].value;
         var amount = parseFloat(inputs[1].value);
         amount = Math.round(amount*100) / 100;
         if(name === "" && !finishError) {
            $("#div_error").append('<p class="error_color"> '+NAMES_NOT_EMPTY+'</p>'); 
            $("#div_error").show("slow", function(){
                $("body").scrollTop($("#div_error").offset().top);
            });
            finishError = true;
            return;
         }
         else if((isNaN(amount) && !finishError) || amount < 0 ){
            $("#div_error").append('<p class="error_color"> '+AMOUNT_GREATER_ZERO+'</p>'); 
            $("#div_error").show("slow", function(){
                $("body").scrollTop($("#div_error").offset().top);
            });      
            finishError = true;
            return;
        }
        else if(amount >= 0){
             spentDict[name] = amount;
        } 
    });

    if(finishError) {
        appendBackBtn();
        return;
    }
   
    var spentDictLen = 0;
    for (var key in spentDict) {
       spentDictLen++;
    }

    if(spentDictLen < 2) {
        $("#div_error").append('<p class="error_color"> '+LEAST_TWO_PERSON+'</p>'); 
        $("#div_error").show("slow", function(){
            $("body").scrollTop($("#div_error").offset().top);
        });
        appendBackBtn();
        return;
    }
        
    var totalAmount = 0;
    for (var key in spentDict) {
       totalAmount += spentDict[key];
    }

    var payPerPeople = (totalAmount / spentDictLen * 1.0);
    payPerPeople = Math.round(payPerPeople*100)/100;

    var i,j = 0;
    for (var key in spentDict) {                         
        var amount = spentDict[key] - payPerPeople;               
        if( amount >= 0 ) {
           posBalanceName.push(key);
           posBalanceMoney.push(amount);
           i++;
        }else {
           negBalanceName.push(key);
           negBalanceMoney.push(amount*(-1));
           j++;
        }
    }
    
    buildSplitTable();
    $('#main_head').hide("slow");
    $('#result').empty();
    $('#result').append('<p class="lead"> <img src="'+IMG_DIR+'glyphicons-43-pie-chart.png"/> '+RESULT+'</p>');
    $('#result').append('<p class="lead" class="amount_per_person_color"> '+TOTAL_COST+' <span class="error_color">$'+ totalAmount.toFixed(2) +'</span></p>');
    $('#result').append('<p class="lead" class="amount_per_person_color"> '+AMOUNT_PER_PERSON+' <span class="error_color">$'+ payPerPeople.toFixed(2) +'</span></p>');
    $('#result').append('<p class="lead" class="split_ways_color"> '+TOTAL_SPLIT+' <span class="error_color">'+ splitTable.length +'</span></p>');
    $('#result').append('<table cellspacing="0" class="table_result" id="table_result"></table>'); 
    $('#result').append('<br>');
    $('#result').append('<button type="button" id="changeWay" class="btn btn-success change_way_margin" onclick="showResult()"><img src="'+IMG_DIR+'glyphicons-84-random.png" class="result_icons_size">  '+TRY_ANOTHER_SPLIT+'</button>');
    $('#result').append('<br>');
    $('#result').append('<button type="button" id="back_btn" class="btn change_way_margin" onclick="backToMain()"><img src="'+IMG_DIR+'glyphicons-211-left-arrow.png" class="result_icons_size">  '+ BACK_TO_MAIN +'</button>');
    $('#result').append('<br>');
    $('#result').append('<button type="button" class="btn btn-primary" onclick="reset()"><img src="'+IMG_DIR+'glyphicons-366-restart.png" class="result_icons_size">  '+CLEAR+'</button><br>');
    showResult();
}

function buildSplitTable() {
    splitTable = [];
    splitIdx = 0;
    totalCicles = negBalanceName.length * posBalanceName.length;
    for(var i = 0; i < totalCicles; i++ ){
        var newSplit = getNewSplit();
        if(!duplicatedSplit(newSplit)){
            splitTable.push(newSplit);
        }
        else{
            break;
        }
    }
}

function showResult() {
    var nextSplitButtomText;
    if(splitTable.length === 1) {
        nextSplitButtomText = TRY_ANOTHER_SPLIT;
        $('#changeWay').prop('disabled', true);
    }
    else {
        nextSplitButtomText = TRY_ANOTHER_SPLIT + '('+(splitTable.length-splitIdx)+')';
    }
    document.getElementById("changeWay").innerHTML='<img src="'+IMG_DIR+'glyphicons-84-random.png" class="result_icons_size">'+nextSplitButtomText;

    var table = $('#table_result'); 
    table.empty();
    table.append('<tr><th>'+FROM+'</th><th>'+TO+'</th><th>'+AMOUNT_TO_PAY+'</th></tr>');
    if(splitIdx + 1 === splitTable.length){
        splitIdx = 0;
    }else{
        splitIdx++;   
    }
    
    for(var i = 0; i < splitTable[splitIdx].length; i++)
            table.append('<tr>' + 
                        '<td>' + splitTable[splitIdx][i].from + '</td>' +                 
                        '<td>' + splitTable[splitIdx][i].to+ '</td>' +
                        '<td>$' + (splitTable[splitIdx][i].amount).toFixed(2) + '</td>' +
                        '</tr>'); 
  
    $("#result").show("slow", function(){
       $("body").scrollTop($("#result").offset().top);
    });
}

function duplicatedSplit(newSplit){
    if(splitTable.length===0) return false;
    for(var i = 0; i < splitTable.length; i++){
        if(splitEqual(newSplit, splitTable[i])) {
            return true;
        }
    }
    return false;
}

function splitEqual(split1, split2){
    if(split1.length !== split2.length) return false;
    for(var i = 0; i < split1.length; i++){
        if(!hasTheSplit(split2, split1[i])){
            return false;
        }
    }
    for(var i = 0; i < split2.length; i++){
        if(!hasTheSplit(split1, split2[i])){
            return false;
        }
    }
    return true;
}

function hasTheSplit(splitList, newsplit){
    for(var j = 0; j < splitList.length; j++){
        if(splitList[j].from === newsplit.from &&
           splitList[j].to === newsplit.to && 
           ( splitList[j].amount === newsplit.amount-0.01 ||
             splitList[j].amount-0.01=== newsplit.amount ||
             splitList[j].amount === newsplit.amount)) 
        {
            return true;
        }
    }
    return false;
}
function getNewSplit() {
    if(arrRotate < negBalanceName.length){
        rotateArr(negBalanceName);
        rotateArr(negBalanceMoney);
        if(posBalanceName.length > 1) arrRotate++;                
    }else {
        rotateArr(posBalanceName);
        rotateArr(posBalanceMoney);
        arrRotate = 0;
    }
   
    var t_posBalanceMoney = posBalanceMoney.slice(0);
    var t_negBalanceMoney = negBalanceMoney.slice(0);
    var amountToPay = 0;
    var retArray = [];

    for(var i = 0; i < posBalanceName.length; i++) {
        if(t_posBalanceMoney[i] !== 0) {
            for(var j = 0; j < negBalanceName.length; j++) {
                if(t_negBalanceMoney[j] !== 0) {
                    if(t_posBalanceMoney[i] > t_negBalanceMoney[j]) {
                        amountToPay = t_negBalanceMoney[j];
                        t_posBalanceMoney[i] = t_posBalanceMoney[i] - t_negBalanceMoney[j]; 
                        t_negBalanceMoney[j] = 0;                             
                    }else {
                        amountToPay = t_posBalanceMoney[i];
                        var rest = t_negBalanceMoney[j] - t_posBalanceMoney[i];        
                        t_negBalanceMoney[j] = rest;
                        t_posBalanceMoney[i] = 0;                  
                    }
                    amountToPay = Math.round(amountToPay*100)/100;
                    tuple = { from: negBalanceName[j], 
                              to: posBalanceName[i],
                              amount: amountToPay
                            };            
                    retArray.push(tuple);
                    if(t_posBalanceMoney[i] === 0) break;
                }
            }
        }
    }
    return retArray;
}

function rotateArr(arr1){
    temp = arr1.shift();
    arr1.push(temp);
}

function reset(){
    $("#result").hide("slow");
    $("div[id^='p_row_']").remove();
    addField();
    addField();
    $("#logo").show("slow");
    $("#main_head").show("slow");
    $("#forms").show("slow");
    $('#op_btns').show("slow");
    $('#footer').show("slow");
}

function appendBackBtn(){
    var backBtn= '<button type="button" id="back_btn" class="btn" onclick="backToMain()"><img src="'+IMG_DIR+'glyphicons-211-left-arrow.png" class="result_icons_size">  '+ BACK_TO_MAIN+'</button>';
    $('#div_error').append(backBtn);
}

function backToMain(){
    $('#div_error').hide("slow");
    $('#result').hide("slow");
    $('#about').hide("slow");
    
    $('#logo').show("slow");
    $('#main_head').show("slow");
    $('#forms').show("slow");
    $('#op_btns').show("slow");
    $('#footer').show("slow");
}   

function showAbout(){
    $('#div_error').hide("slow");
    $('#result').hide("slow");
    $('#forms').hide("slow");
    $('#op_btns').hide("slow");
    $('#footer').hide("slow");
    $('#about').show();
}