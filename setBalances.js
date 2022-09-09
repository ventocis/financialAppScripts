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
    const lmcuBal = getTotalBalanceAtBank(lmcu.accessToken, LMCUBalanceAdder);
    lmcuRange.setValue(lmcuBal);
    const allyBal = getTotalBalanceAtBank(ally.accessToken, (acc, cur) => acc + getBal(cur));
    allyRange.setValue(allyBal);
}

function getTotalBalanceAtBank(accessToken, balanceAdder) {
    const payload = Object.assign({}, basePayload, { access_token: accessToken });
    const res = UrlFetchApp.fetch('https://development.plaid.com/accounts/balance/get', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
    });
    const responseObj = JSON.parse(res.getContentText());
    return responseObj.accounts.reduce(balanceAdder, 0);
}

function LMCUBalanceAdder(acc, cur) {
    if (cur.account_id == realEstateAccountId) {
        return acc;
    } else {
        return acc + getBal(cur);
    }
}

function getBal(account) {
    return account?.balances?.available || account?.balances?.current;
}
