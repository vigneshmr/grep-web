// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const homeInfoPage = document.getElementsByClassName("HomeInfoV2")

if (homeInfoPage) {
    let elem = homeInfoPage.item(0).innerText;
    let factSqFt = getValueOfSuffixFromList(elem.split('\n'), 'Sq Ft');

    elem = document.getElementsByClassName("keyDetailsList")
    let lotSize = getValueOfPrefixFromList(elem.item(0).innerText.split('\n'), 'Lot Size');

    elem = document.getElementsByClassName("keyDetailsList")
    let yearBuilt = getValueOfPrefixFromList(elem.item(0).innerText.split('\n'), 'Year Built');

    elem = document.getElementsByClassName("keyDetailsList")
    let sqFtPrice = getValueOfPrefixFromList(elem.item(1).innerText.split('\n'), 'Price/Sq.Ft.');

    elem = document.getElementsByClassName("homeAddress")
    let addr = elem.item(0).innerText.split('\n')[0];
    let city = elem.item(0).innerText.split('\n')[1];
    if(city){
        city = city.split(',')[0];
    }

    let sqFtNum
    let acreNum
    if(lotSize.includes("Acres")) {
        sqFtNum = Number(lotSize.replace(' Acres', '').replace(',',''))*43560;
    } else if (lotSize.includes("Sq. Ft.")) {
        sqFtNum = Number(lotSize.replace(' Sq. Ft.', '').replace(',',''));
    }

    sqFtNum = sqFtNum.toFixed(0);
    acreNum = sqFtNum/43560;
    acreNum = acreNum.toFixed(2);

    var div = document.createElement("div");
    div.id = "grep_info";
    
    let ul = document.createElement('ul');    
    ul.appendChild(buildListItem(`${addr}`));
    ul.appendChild(buildListItem(`${city}`));
    ul.appendChild(buildListItem(`[📏] Area: ${factSqFt} | Lot Size: ${acreNum} acr / ${sqFtNum} sq.ft | Price/Sq.Ft.: ${sqFtPrice}`));

    if(yearBuilt) {
        ul.appendChild(buildListItem(`[⏱️] Age: ${new Date().getFullYear() - Number(yearBuilt)} years (built: ${yearBuilt})`));
    }
    div.appendChild(ul);

    // lot info ...
    let lotInfoDiv = getDivForLotInfo();
    if(lotInfoDiv) {
        lotInfoDiv.style.fontSize = '12px';

        var text = lotInfoDiv.innerHTML;
        var newText = text.replace(/yard/ig, '<span style="background-color: yellow;">$&</span>');
        lotInfoDiv.innerHTML = newText;

        div.append(lotInfoDiv);
    }

    div.style.top = 120 + 'px';
    div.style.display = "block";
    div.style.backgroundColor = '#80ced6';
    
    document.body.prepend(div);
}

function getDivForLotInfo() {
    var xpath = "//div[text()='Lot Information']";
    var matchingElement = document.evaluate(
        xpath, document, null, 
        XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    return matchingElement.parentNode;
}

function buildListItem(text) {
    let li = document.createElement('li');
    li.textContent = text;
    return li;
}

function getValueOfPrefixFromList(items, prefixLabel) {
    let fact = undefined;   
    for ( let i = 0; i < items.length -1;i++){
        if (items[i] == prefixLabel){
            fact = `${items[i+1]}`;
        }
    }
    return fact
}

function getValueOfSuffixFromList(items, suffixLabel) {
    let fact = undefined;   
    for ( let i = 0; i < items.length ;i++){
        if (items[i] == suffixLabel){
            fact = `${items[i-1]} ${suffixLabel}`;
        }
    }
    return fact
}
