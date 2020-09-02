var helper = {};


helper.generateRandomString = (stringLength) => { 
    stringLength = typeof(stringLength) === 'number' ? stringLength : 20;
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
    var str = '';
    for(i = 0; i < stringLength; i++){
        var randomChar = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        str+= randomChar;
    }
    return str;
}

helper.formatObject = (oldObject = {}, newObject ={}) => {
    let tempObj  = {}
    Object.keys(newObject).map(key => {
        if(oldObject.hasOwnProperty(key)){
            tempObj[key] = newObject[key];
        }
    })
    return {...oldObject, ...tempObj};
}

helper.isAdmin = (auth, fileUtil, callback) => {
    if (username, password) {
        const userFile = `${username}-${password}`;
        fileUtil.read('users', userFile, (err, user) => {
            if (!err && user) {
                const role = user.role;
                if (role === 'admin') {
                    callback()
                } else {
                    callback()
                }
            } else {
                callback()
            }
        });
    } else {
        callback()
    }

}

module.exports = helper;