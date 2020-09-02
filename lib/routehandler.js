const fileUtil = require('./fileUtil');
const routeHandler = {};
const helper = require('./helper');

routeHandler.Books = (data, callback) => {
    const acceptableHeaders = ["post", "get", "put", "delete"];
    if (acceptableHeaders.indexOf(data.method) > -1) {
        routeHandler._books[data.method](data, callback);
    } else {
        callback(405);
    }
};

//main book route object
routeHandler._books = {};

//Post route -- for creating a book
routeHandler._books.post = (data, callback) => {
    //validate that all required fields are filled out

    const { username, password } = data.headers;

    var name = typeof (data.payload.name) === 'string'
        && data.payload.name.trim().length > 0 ? data.payload.name : false;
    
    var price = typeof (data.payload.price) === 'string'
        && !isNaN(parseInt(data.payload.price)) ? data.payload.price : '50.99';
    
    var author = typeof (data.payload.author) === 'string'
        && data.payload.author.trim().length > 0 ? data.payload.author : false;
    
    var publisher = typeof (data.payload.publisher) === 'string'
        && data.payload.publisher.trim().length > 0 ? data.payload.publisher : false;
    
    var copies = typeof (data.payload.copies) === 'string'
        && data.payload.copies.trim().length > 0 ? data.payload.copies : 10;
    
    if (username && password) {
        const userFile = `${username}-${password}`;
        fileUtil.read('users', userFile, (err, user) => {
            if (!err && user) {
                const role = user.role;
                if (role === 'admin') {
                    if(name && author && publisher){
                        const fileName = helper.generateRandomString(30);
                        data.payload.price = price;
                        data.payload.copies = copies;
                
                        fileUtil.create('books', fileName, data.payload, (err) => {
                            if (!err) {
                                callback(200, { message: "book added successfully", data: null });
                            } else {
                                callback(400, { message: "could not add book" });
                            }
                        });
                    } else {
                        callback(400, {status: 'fail', message: "Book not added",
                            required: {
                                name: 'string',
                                author: 'string',
                                publisher: 'string'
                            }
                        });
                    }
                }else {
                    callback(400, {status: 'fail', message: "You're not authenticated, user role must be admin",
                        required: {
                            username: 'string',
                            password: 'string',
                        }
                    });
                }
            }
        })
    }
};
//Get route -- for geting a book
routeHandler._books.get = (data, callback) => {
    const filename = data.query.name;    

    const username = typeof data.payload.username === 'string'
        && data.payload.username.trim().length > 0 ? data.payload.username : false;
    
    const password = typeof data.payload.password === 'string'
        && data.payload.password.trim().length > 0 ? data.payload.password : false;
    
    const userFile = `${username}-${password}`;

    if (username && password) {
        fileUtil.read('users', userFile, (err, user) => {
            if (!err && user) {
                user.borrowed = user.borrowed + 1;
                fileUtil.update('users', userFile, user, (err) => {
                    if (err) {
                        console.log('Error: ', err);
                    }
                })
                if (filename) {
                    fileUtil.read('books', filename, (err, data) => {
                        if (!err && data) {
                            if (data.copies > 0) {
                                data.copies = data.copies - 1;
                                
                                fileUtil.update('books', filename, data, (err) => {
                                    if (err) {
                                        console.log('Error: ', err);
                                        callback(500, { status: 'fail', message: 'Failed' });
                                    }
                                });
                                // delete data.copies;

                                callback(200, { message: 'book retrieved', data: data });
                            } else {
                                callback(404, { status: 'fail', message: 'Book Has finished' });
                            }
                        } else {
                            console.log('Error: ', err);

                            callback(404, {
                                status: 'fail',
                                data: data,
                                message: 'could not retrieve book'
                            });
                        }
                    });
                } else {
                    callback(404, { status: 'fail', message: 'book not found', data: null });
                }
            } else {
                callback(400, {
                    status: 'fail',
                    message: `Sorry you're not authenticated. Enter username and password`
                });
            }
        });
    } else {
        callback(400, {
            status: 'fail',
            message: "Not authenticated",
            required: {
                username: 'string',
                password: 'string'
            }
        });
    }
};
//Put route -- for updating a book
routeHandler._books.put = (data, callback) => {
    const { username, password } = data.headers;
    if (username && password) {
        const userFile = `${username}-${password}`;
        fileUtil.read('users', userFile, (err, user) => {
            if (!err && user) {
                const role = user.role;
                if (role === 'admin') {
                    if (data.query.name) {
                        fileUtil.update('books', data.query.name, data.payload,  (err) => {
                            if (!err) {
                                callback(200, {message : 'book updated successfully'})
                            }else{
                                callback(400, {err : err, data : null, message : 'could not update book'});
                            }
                        });
                    } else {
                        callback(404, { message: 'book not found' });
                    }
                }else {
                    callback(400, {status: 'fail', message: "You're not authenticated, user role must be admin",
                        required: {
                            username: 'string',
                            password: 'string',
                        }
                    });
                }
            }
        })
    }
};
//Delete route -- for deleting a book
routeHandler._books.delete = (data, callback) => {
    const { username, password } = data.headers;
    if (username && password) {
        const userFile = `${username}-${password}`;
        fileUtil.read('users', userFile, (err, user) => {
            if (!err && user) {
                const role = user.role;
                if (role === 'admin') {
                    if(data.query.name){
                        fileUtil.delete('books', data.query.name, (err) => {
                            if(!err){   
                                callback(200, {message : 'book deleted successfully'});
                            }else{
                                callback(400, {err : err, message : 'could not delete book'});
                            }
                        })
                    }else{
                        callback(404, {message : 'book not found'});
                    }
                }else {
                    callback(400, {status: 'fail', message: "You're not authenticated, user role must be admin",
                        required: {
                            username: 'string',
                            password: 'string',
                        }
                    });
                }
            }
        })
    } else {
        callback(400, {
            status: 'fail', message: 'Only admin can perform this action',
            require: {
                username: 'string',
                password: 'string'
            }
        });
    }
};
 
routeHandler.register = (data, callback) => {
    var name = typeof data.payload.name === 'string'
        && data.payload.name.trim().length > 0 ? data.payload.name : false;
    
    var username = typeof data.payload.username === 'string'
        && data.payload.username.trim().length > 0 ? data.payload.username : false;
    
    var password = typeof data.payload.password === 'string'
        && data.payload.password.trim().length > 0 ? data.payload.password : false;
    
    data.payload.role = 'user';
    data.payload.borrowed = 0;
    
    if (name && username && password) {
        const filename = `${username}-${password}`;
        fileUtil.create('users', filename, data.payload, (err) => {
            if (!err) {
                callback(200, {
                    message: "user registered successfully",
                    data: null
                });
            } else {
                callback(500, { message: "Registration failed" });
            }
        });
    } else {
        callback(400, {
            status: 'fail', required: {
                name: 'string',
                username: 'string',
                password: 'string'
            }
        });
    }
}

routeHandler.return_book = (data, callback) => {
    var username = typeof data.payload.username === 'string'
        && data.payload.username.trim().length > 0 ? data.payload.username : false;
    
    var password = typeof data.payload.password === 'string'
        && data.payload.password.trim().length > 0 ? data.payload.password : false;
    
    var bookname = data.query.name;

    const userFile = `${username}-${password}`;
    if (username && password) {
        fileUtil.read('users', userFile, (err, user) => {
            if (user.borrowed > 0) {
                user.borrowed = user.borrowed - 1;
                if (!err && user) {
                    fileUtil.update('users', userFile, user, (err) => {
                        if (err) {
                            console.log("Error: ", err);
                            callback(500, { message: "Can't update user info" });
                        }
                    })
                    if (bookname) {
                        fileUtil.read('books', bookname, (err, book) => {
                            if (!err && book) {
                                book.copies = book.copies + 1;
                                fileUtil.update('books', bookname, book, (err) => {
                                    if (err) {
                                        console.log("Error: ", err);
                                        callback(500, { message: "Can't update book info"});
                                    } else {
                                        callback(201, { message: "Book successfully returned"});
                                    }
                                } )
                            } else {
                                console.log("Error: ", err);
                                callback(500, { message: "Can't update book info"});
                            }
                        })
                    }
                } else {
                    callback(404, { message: "Error finding user, check user details"});
                }
            } else {
                callback(400, { message: "You have 0 borrowed books"});
            }
        })
    } else {
        callback(400, {
            status: 'fail',
            message: "Not authenticated",
            required: {
                username: 'string',
                password: 'string'
            }
        });
    }
}

routeHandler.ping = (data, callback) => {
    callback(200, { response: "server is live" });
};
routeHandler.notfound = (data, callback) => {
    callback(404, { response: 'not found' });
};

module.exports = routeHandler;