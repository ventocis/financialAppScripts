const lmcu = {
    itemId: PropertiesService.getScriptProperties().getProperty('lmcuItemId'),
    accessToken: PropertiesService.getScriptProperties().getProperty('lmcuAccessToken'),
};

const ally = {
    itemId: PropertiesService.getScriptProperties().getProperty('allyItemId'),
    accessToken: PropertiesService.getScriptProperties().getProperty('allyAccessToken'),
};

const plaid = {
    secret: PropertiesService.getScriptProperties().getProperty('plaidSecret'),
    clientId: PropertiesService.getScriptProperties().getProperty('plaidClientId'),
};

const realEstateAccountId = 'Re7JNLPVKmUAmo7wE617cn3b6YjMY9f97749v';

const basePayload = {
    client_id: plaid.clientId,
    secret: plaid.secret,
};

const balSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Balances');
const allyRange = balSheet.getRange(2, 2);
const lmcuRange = balSheet.getRange(2, 3);

function setBalances() {
    const lmcuBal = getLMCUBal();
    lmcuRange.setValue(lmcuBal);
    const allyPayload = Object.assign({}, basePayload, { access_token: ally.accessToken });
    const allyRes = UrlFetchApp.fetch('https://development.plaid.com/accounts/balance/get', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(allyPayload),
    });
    const allyObj = JSON.parse(allyRes.getContentText());
    const allyAmount = getBal(allyObj.accounts[0]);
    allyRange.setValue(allyAmount);
}

function getLMCUBal() {
    const lmcuPayload = Object.assign({}, basePayload, { access_token: lmcu.accessToken });
    const res = UrlFetchApp.fetch('https://development.plaid.com/accounts/balance/get', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(lmcuPayload),
    });
    const obj = JSON.parse(res.getContentText());
    const sum = obj.accounts.reduce((acc, cur) => {
        if (cur.account_id == realEstateAccountId) {
            return acc;
        } else {
            return acc + getBal(cur);
        }
    }, 0);
    return sum;
}

function getBal(account) {
    return account?.balances?.available || account?.balances?.current;
}
