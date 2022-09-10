const balSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('-Balance Sheet');

//the names in each object aren't needed. They're just there to make it easier to know
//which institution is which
const institutions = [
    {
        name: 'ally',
        accessToken: PropertiesService.getScriptProperties().getProperty('allyAccessToken'),
        cell: balSheet.getRange(2, 2),
    },
    {
        name: 'lmcu',
        accessToken: PropertiesService.getScriptProperties().getProperty('lmcuAccessToken'),
        cell: balSheet.getRange(2, 3),
    },
    {
        name: 'schwab',
        accessToken: PropertiesService.getScriptProperties().getProperty('schwabAccessToken'),
        cell: balSheet.getRange(2, 5),
    },
];

const plaidCreds = {
    secret: PropertiesService.getScriptProperties().getProperty('plaidSecret'),
    client_id: PropertiesService.getScriptProperties().getProperty('plaidClientId'),
};

function getTotalBalances() {
    const requests = getRequestObjs();
    const responses = UrlFetchApp.fetchAll(requests);
    responses.forEach((response, i) => {
        const responseObj = JSON.parse(response.getContentText());
        const totalBalanceAtBank = responseObj.accounts.reduce((acc, cur) => acc + getBal(cur), 0);
        institutions[i].cell.setValue(totalBalanceAtBank);
    });
}

function getRequestObjs() {
    return institutions.map((institution) => {
        return {
            payload: JSON.stringify({
                ...plaidCreds,
                access_token: institution.accessToken,
            }),
            url: 'https://development.plaid.com/accounts/balance/get',
            method: 'POST',
            contentType: 'application/json',
        };
    });
}

function getBal(account) {
    return account?.balances?.available || account?.balances?.current;
}
