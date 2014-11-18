/*
  local-json redis storage method v0.0.1
  copyright 2014 - kevin von flotow
  MIT license
*/
;( function ()
	{
		var redis = require( 'redis' )

		var LocalJson = require( 'local-json' )

		module.exports = LocalJson.StorageMethod.define( 'redis', function ( storageMethod )
			{
				return function ( options )
				{
					options = options || {}

					// attempt to use default client if one is not passed through options
					options.client = options.client || redis.createClient()

					// hash name to use in redis
					options.hash = options.hash || 'local-json-data'

					// default ttl is 1 day
					options.ttl = typeof options.ttl !== 'undefined' ? parseInt( options.ttl ) : 86400

					storageMethod.init = function ()
					{
						if ( !options.client )
						{
							return
						}

						// prune data on start. this is probably not desired,
						// since it wipes the cache every time a new server is created.
						//
						// but we need to do something because the file watcher
						// cannot detect changes to files while node isn't running
						options.client.del( options.hash, function ( err )
							{
								
							}
						)
					}

					storageMethod.get = function ( filePath, done )
					{
						if ( !options.client )
						{
							return done()
						}

						options.client.hget( options.hash, filePath, function ( err, dataReply )
							{
								if ( err || !dataReply )
								{
									return done( err )
								}

								// use LocalJson.TryParse to prevent crashing the server
								done( err, LocalJson.TryParse( JSON.parse, dataReply ) )
							}
						)
					}

					storageMethod.set = function ( filePath, data, done )
					{
						if ( !options.client )
						{
							return done()
						}

						// use JSON.stringify to convert object to string for redis
						options.client.hset( options.hash, filePath, JSON.stringify( data ), function ( err )
							{
								done( err )
							}
						)
					}

					storageMethod.remove = function ( filePath, done )
					{
						if ( !options.client )
						{
							return done()
						}

						options.client.hdel( options.hash, filePath, function ( err )
							{
								done( err )
							}
						)
					}

					return storageMethod
				}
			}
		)
	}
)();
