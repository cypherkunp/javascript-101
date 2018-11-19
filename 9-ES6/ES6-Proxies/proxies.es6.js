/*
To create a proxy object, we use the Proxy constructor - new Proxy();.

The proxy constructor takes two items:
1. the object that it will be the proxy for
2. an object containing the list of methods it will handle for the proxied object
The second object is called the handler.
*/


/*
A Pass Through Proxy
The simplest way to create a proxy is to provide an object and then an empty handler object.
*/

var richard = {status: 'Looking for work!'};
var agent = new Proxy(richard, {});

console.log(agent.status);

/*
The above doesn't actually do anything special with the proxy - it just passes the request
directly to the source object! If we want the proxy object to actually intercept the request,
that's what the handler object is for!

The key to making Proxies useful is the handler object that's passed as the second object to
the Proxy constructor.

The handler object is made up of a methods that will be used for property access. Let's look at the get:
*/