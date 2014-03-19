(function(){

	if (typeof jQuery === 'undefined') {

		var s = document.createElement( 'script' )
		s.onload = function(){
			var m = document.createElement( 'script' )
			m.type = 'text/javascript'
			m.innerHTML = '(' + main.toString() + ')();';
			document.body.appendChild( m )
		}
		s.type = 'text/javascript'
		s.src = '//code.jquery.com/jquery-1.11.0.min.js'

		document.body.appendChild( s )
		return false;
	} else {
		jQuery(document).ready( main );
	}


	function main () {

		jQuery( "<style>.coin-address-tip{font-size:14px;font-weight:normal;position:absolute;padding:1em;width:12em;background-color:white;border:2px solid black;border-radius:0.6em;top:-999em;left:-999em;}</style>" ).appendTo( "head" )

		var addressRegex = /([13][0-9a-zA-Z]{26,33})/
		var satoshi = 100000000
		var template = "<span class='coin-address'>$1</span>"
		var tip_template = "<b>In:</b> ɃRECIEVED <br/><b>Out:</b> ɃSENT <br/><b>Bal:</b> ɃTOTAL <br/><a href='http://blockchain.info/address/ADDR' target='_blank'>View</a>"

		var containsAddress = function( str ){
			var test = addressRegex.test(str);
			if (test) {
			}
			return test
		}

		var wrapAddress = function( el ) {

			var $el = jQuery(el)
			var content = $el.text()
			var addr = content.match( addressRegex )[0]
			var parent = el.parentNode
			var replacement = content.replace( addressRegex, template )
			var newEl = jQuery('<span />').html( replacement )[0]
			parent.replaceChild( newEl, el )
		}

		var getAddressData = function(addr, cb){
			jQuery.ajax( {
				url: "//query.yahooapis.com/v1/public/yql?q=select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Fblockchain.info%2Faddress%2F" + addr + "%3Fformat%3Djson%22&format=json&diagnostics=true&callback=",
				type: 'GET',
				success: function( response ) { try{ cb( null, response.query.results.json ); } catch(err) { cb( err, null ); } }
			})
		}

		var showInfo = function(el){
			var $el = jQuery(el)
			if ( typeof el.$tip === 'function' ) {
				el.$tip().remove();
			}
			
			var addr = $el.text().match( addressRegex )[0]
			var $tip = jQuery('<span />').addClass('coin-address-tip').html( 'Loading...' )
			$tip.css({ left: $el.position().left + $el.width() / 2, top: $el.position().top - 40 })
			jQuery('body').append( $tip )

			el.$tip = function(){ return $tip; }

			getAddressData( addr, function( err, data ){
				if (err) {
					$tip.html( 'Error fetching data. (see console for error)' )
					throw new Error( err )
					return;
				} else {
					$tip.html( tip_template
						.replace( 'ADDR', addr )
						.replace( 'TOTAL', data.final_balance / satoshi )
						.replace( 'SENT', data.total_sent / satoshi )
						.replace( 'RECIEVED', data.total_received / satoshi )
					)
				}
			});
			
		}

		var clearInfo = function(el){
			jQuery(el).remove()
		}

		var addressNodes = jQuery('body *').contents().filter(function() {
			return this.nodeType === 3 && containsAddress(this.nodeValue); //Node.TEXT_NODE
		}).each(function(){
			wrapAddress( this )
		})

		jQuery('body').on( 'click', '.coin-address', function(){ showInfo(this) }  )
		jQuery('body').on( 'click', '.coin-address-tip', function(){ clearInfo(this) }   )

	}
})();