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

const curFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

// returns [sqFt, acres]
function areaStrToValues(lotSize) {
    let lotSqFtNum
    let lotAcreNum
    if (lotSize.includes("Acres")) {
        lotSqFtNum = Number(lotSize.replaceAll(' Acres', '').replaceAll(',', '')) * 43560;
    } else if (lotSize.includes("Sq. Ft.")) {
        lotSqFtNum = Number(lotSize.replaceAll(' Sq. Ft.', '').replaceAll(',', ''));
    } else if (lotSize.includes("Sq Ft")) {
        lotSqFtNum = Number(lotSize.replaceAll(' Sq Ft', '').replaceAll(',', ''));
    }

    lotSqFtNum = lotSqFtNum.toFixed(0);
    lotAcreNum = lotSqFtNum / 43560;
    lotAcreNum = lotAcreNum.toFixed(2);
    return [lotSqFtNum, lotAcreNum];
}

function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
}

if (homeInfoPage) {
    let elem = homeInfoPage.item(0)?.innerText;
    let factSqFt = getValueOfSuffixFromList(elem.split('\n'), 'Sq Ft');

    elem = document.getElementsByClassName("keyDetailsList")
    let lotSize = getValueOfPrefixFromList(elem.item(0)?.innerText.split('\n'), 'Lot Size');

    elem = document.getElementsByClassName("keyDetailsList")
    let yearBuilt = getValueOfPrefixFromList(elem.item(0)?.innerText.split('\n'), 'Year Built');

    elem = document.getElementsByClassName("keyDetailsList")
    let sqFtPrice = getValueOfPrefixFromList(elem.item(1)?.innerText.split('\n'), 'Price/Sq.Ft.');

    // price
    elem = document.getElementsByClassName("keyDetailsList")
    let listPrice = getValueOfPrefixFromList(elem.item(1)?.innerText.split('\n'), 'List Price');
    if (!listPrice) {
        listPrice = document.getElementsByClassName('statsValue')[0].textContent;
    }
    if (listPrice) {
        listPrice = listPrice.replaceAll('$', '').replaceAll(',', '');
    }

    elem = document.getElementsByClassName("keyDetailsList")
    let rfEstiPrice = getValueOfPrefixFromList(elem.item(1)?.innerText.split('\n'), 'Redfin Estimate');
    if (rfEstiPrice) {
        rfEstiPrice = rfEstiPrice.replaceAll('$', '').replaceAll(',', '');
    }

    elem = document.getElementsByClassName("homeAddress")
    let addr = elem.item(0)?.innerText.split('\n')[0];
    addr = addr.replace(/,\s*$/, "");   // remove comma
    addr = titleCase(addr);             // make it title case

    let city = elem.item(0)?.innerText.split('\n')[1];
    if (city) {
        city = city.split(',')[0];
    }

    let lotSqFtNum, lotAcreNum;
    let livableSqFtNum, livableAcreNum;
    if (lotSize) {
        [lotSqFtNum, lotAcreNum] = areaStrToValues(lotSize);
    }
    if (factSqFt) {
        [livableSqFtNum, livableAcreNum] = areaStrToValues(factSqFt);
    }

    var div = document.createElement("div");
    div.id = "grep_info";
    div.style.display = 'flex';

    var divCol1 = document.createElement("div");
    divCol1.style.float = 'right';
    divCol1.style.width = '50%';
    divCol1.style.height = 1;
    divCol1.style.flex = '50%';
    div.appendChild(divCol1);

    var divCol2 = document.createElement("div");
    divCol2.style.float = 'right';
    divCol2.style.width = '50%';
    divCol2.style.height = 1;
    divCol2.style.flex = '50%';
    div.appendChild(divCol2);


    let ul = document.createElement('ul');

    // address item ...
    let itemAddr = document.createElement('a');
    itemAddr.href = document.URL;
    itemAddr.text = `${addr}`;
    itemAddr.style.cursor = 'pointer';
    itemAddr.style.color = 'white';
    itemAddr.style.fontWeight = 'bold';
    itemAddr.addEventListener('click', function (evt) {
        copyURIToClipboard(evt);
        console.log(`Copied to clipboard: ${addr}`);
        evt.target.blur();
    });
    ul.appendChild(itemAddr);

    // other items ...
    ul.appendChild(buildListItem(`${city}`));
    ul.appendChild(buildListItem(`[📏] Area: ${factSqFt} | Lot Size: ${lotAcreNum} acr / ${lotSqFtNum} sq.ft`));

    let liPrice = `[💰] Listed: Price: ${curFormatter.format(listPrice)} Price/Sq.Ft.: ${sqFtPrice}`;
    if (rfEstiPrice) {
        liPrice += ` | EstΔ %: ${(100 * (rfEstiPrice - listPrice) / listPrice).toFixed(1)}% ${curFormatter.format(rfEstiPrice - listPrice)}`;
    }
    ul.appendChild(buildListItem(liPrice));
    if (rfEstiPrice) {
        ul.appendChild(buildListItem(`[💰] Listed: Estimated: ${curFormatter.format(rfEstiPrice)} Price/Sq.Ft.: ${curFormatter.format((rfEstiPrice / livableSqFtNum).toFixed(0))}`));
    }

    if (yearBuilt) {
        ul.appendChild(buildListItem(`[⏱️] Age: ${new Date().getFullYear() - Number(yearBuilt)} years (built: ${yearBuilt})`));
    }
    div.appendChild(ul);

    summarizeDiv(divCol2, 'Lot Information', 'Lot info');
    summarizeDiv(divCol2, 'Garage & Parking', 'Garage');

    // div.style.top = 120 + 'px';
    div.style.display = "block";
    div.style.backgroundColor = '#000000';
    div.style.color = '#ffffff';

    document.body.prepend(div);
}

function summarizeDiv(rootDiv, divTitleStr, title) {
    let innerDiv = getDivForSection(divTitleStr)
    if (innerDiv) {
        innerDiv.style.fontSize = '12px';
        var text = innerDiv.innerHTML;
        var newText = text.replace(/yard/ig, '<span style="background-color: blue;">$&</span>');
        innerDiv.innerHTML = newText;
        rootDiv.append(title);
        rootDiv.append(innerDiv);
    }
}

function getDivForSection(divTitleStr) {
    var xpath = `//div[text()='${divTitleStr}']`;
    var matchingElement = document.evaluate(
        xpath, document, null,
        XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let gg = matchingElement?.parentNode;
    gg?.removeChild(gg.firstChild);
    return gg;
}

function buildListItem(text) {
    let li = document.createElement('li');
    li.textContent = text;
    li.style.fontSize = '13px';
    return li;
}

function getValueOfPrefixFromList(items, prefixLabel) {
    let fact = undefined;
    for (let i = 0; i < items?.length - 1; i++) {
        if (items[i] == prefixLabel) {
            fact = `${items[i + 1]}`;
        }
    }
    return fact
}

function getValueOfSuffixFromList(items, suffixLabel) {
    let fact = undefined;
    for (let i = 0; i < items.length; i++) {
        if (items[i] == suffixLabel) {
            fact = `${items[i - 1]} ${suffixLabel}`;
        }
    }
    return fact
}

function copyURIToClipboard(evt) {
    hrefObj = evt.target;
    let styleCopyCSS = hrefObj.getAttribute('style');
    hrefObj.removeAttribute('style');
    const range = document.createRange();
    range.selectNode(hrefObj);
    let selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    hrefObj.blur();
    hrefObj.setAttribute('style', styleCopyCSS);
    window.getSelection().removeAllRanges();
    evt.preventDefault()
}

function copyTextToClipboard(text) {
    //Create a textbox field where we can insert text to. 
    var copyFrom = document.createElement("textarea");

    //Set the text content to be the text you wished to copy.
    copyFrom.textContent = text;

    //Append the textbox field into the body as a child. 
    //"execCommand()" only works when there exists selected text, and the text is inside 
    //document.body (meaning the text is part of a valid rendered HTML element).
    document.body.appendChild(copyFrom);

    //Select all the text!
    copyFrom.select();

    //Execute command
    document.execCommand('copy');

    //(Optional) De-select the text using blur(). 
    copyFrom.blur();

    //Remove the textbox field from the document.body, so no other JavaScript nor 
    //other elements can get access to this.
    document.body.removeChild(copyFrom);
}
