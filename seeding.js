process
		.on(
				'message',
				function(q) {
					var url_prova = q.url;
					var urlArray = q.urlA;
					var config = q.config;
					var totale = 0;
					var bbox = url_prova.query.bbox.split('/');
					var zfrom = url_prova.query.from;
					var zto = url_prova.query.to;
					var service = config.services[urlArray[0]];
					if (typeof (service) !== 'undefined') {
						var tilemaps = config.services[urlArray[0]].tilemaps[urlArray[1]];
						if (typeof (tilemaps) !== 'undefined') {

							var l, x, y;
							if (zto == null) {
								zto = zfrom;
							}

							for (l = zfrom; l <= zto; l++) {
								var xini = Math
										.floor((bbox[0] - tilemaps.origin[0])
												/ (tilemaps.TileFormat[0] * tilemaps.tilesets[l]));
								var yini = Math
										.floor((bbox[1] - tilemaps.origin[1])
												/ (tilemaps.TileFormat[1] * tilemaps.tilesets[l]));
								if (bbox.length == 4) {
									var xfin = Math
											.ceil((bbox[2] - tilemaps.origin[0])
													/ (tilemaps.TileFormat[0] * tilemaps.tilesets[l])) - 1;
									var yfin = Math
											.ceil((bbox[3] - tilemaps.origin[1])
													/ (tilemaps.TileFormat[1] * tilemaps.tilesets[l])) - 1;
								} else {
									var xfin = Math
											.ceil((tilemaps.boundingbox[2] - tilemaps.origin[0])
													/ (tilemaps.TileFormat[0] * tilemaps.tilesets[l])) - 1;
									var yfin = Math
											.ceil((tilemaps.boundingbox[3] - tilemaps.origin[1])
													/ (tilemaps.TileFormat[1] * tilemaps.tilesets[l])) - 1;
								}
								for (x = xini; x <= xfin; x++) {
									for (y = yini; y <= yfin; y++) {
										totale++;
										var mappe = require('./mappe.js');
										// console.log(y);
										var newArray = [ urlArray[0],
												urlArray[1], l, x, y ];
										mappe.mappa(config, newArray, function(
												err, buffer) {
											if (err) {
												console.log('erorre seeding');
											} else {
												var time = Date();
												process.send({
													tot : totale,
													ora : time
												});

											}

										});
									}
								}
							}
						}
					}

					console.log('file da elaborare= ' + totale);
					// process.exit();
				});
