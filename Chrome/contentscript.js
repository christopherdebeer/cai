$( function() {

	var addressRegex = /([13][0-9a-zA-Z]{26,33})/
	var satoshi = 100000000
	var template = "<span class='coin-address'><span class='addr'>$1</span><span class='tip'><b>In:</b> ɃRECIEVED <br/><b>Out:</b> ɃSENT <br/><b>Total:</b> ɃTOTAL <br/><a href='http://blockchain.info/address/$1' target='_blank'>View on Blockchain.info</a></span></span> "

	var containsAddress = function( str ){
		var test = addressRegex.test(str);
		if (test) {
		}
		return test
	}

	var wrapAddress = function( el ) {

		var $el = $(el)
		var content = $el.text()
		var addr = content.match( addressRegex )[0]
		var parent = el.parentNode

		getAddressData( addr, function( err, data ){
			if (err) return;
			var replacement = content
				.replace( addressRegex, template )
				.replace( 'TOTAL', data.final_balance / satoshi )
				.replace( 'SENT', data.total_sent / satoshi )
				.replace( 'RECIEVED', data.total_received / satoshi )
			var newEl = $('<span />').html( replacement )[0]
			parent.replaceChild( newEl, el )	
		});
	}

	var getAddressData = function(addr, cb){
		$.ajax( {
			url: "//query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Fblockchain.info%2Faddress%2F" + addr + "%3Fformat%3Djson%22&format=json&diagnostics=true&callback=",
			type: 'GET',
			success: function( response ) { try{ cb( null, response.query.results.json ); } catch(err) { cb( err, null ); } }
		})
	}
	var addressNodes = $('body *').contents().filter(function() {
		return this.nodeType === 3 && containsAddress(this.nodeValue); //Node.TEXT_NODE
	}).each(function(){
		wrapAddress( this )
	})


});