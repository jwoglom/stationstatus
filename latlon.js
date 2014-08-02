/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Latitude/longitude spherical geodesy formulae & scripts           (c) Chris Veness 2002-2014  */
/*   - www.movable-type.co.uk/scripts/latlong.html                                                */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
'use strict';
if (typeof module!='undefined' && module.exports) var Geo = require('./geo'); // CommonJS (Node.js)


/**
 * Creates a LatLon point on the earth's surface at the specified latitude / longitude.
 *
 * @classdesc Tools for geodetic calculations
 * @requires Geo
 *
 * @constructor
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 * @param {number} [height=0] - Height above mean-sea-level in kilometres.
 * @param {number} [radius=6371] - (Mean) radius of earth in kilometres.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 */
function LatLon(lat, lon, height, radius) {
    // allow instantiation without 'new'
    if (!(this instanceof LatLon)) return new LatLon(lat, lon, height, radius);

    if (typeof height == 'undefined') height = 0;
    if (typeof radius == 'undefined') radius = 6371;
    radius = Math.min(Math.max(radius, 6353), 6384);

    this.lat    = Number(lat);
    this.lon    = Number(lon);
    this.height = Number(height);
    this.radius = Number(radius);
}


/**
 * Returns the distance from 'this' point to destination point (using haversine formula).
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Distance between this point and destination point, in km (on sphere of 'this' radius).
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
 *     var d = p1.distanceTo(p2); // d.toPrecision(4): 404.3
 */
LatLon.prototype.distanceTo = function(point) {
    var R = this.radius;
    var phi1 = this.lat.toRadians(),  lambda1 = this.lon.toRadians();
    var phi2 = point.lat.toRadians(), lambda2 = point.lon.toRadians();
    var deltaphi = phi2 - phi1;
    var deltalambda = lambda2 - lambda1;

    var a = Math.sin(deltaphi/2) * Math.sin(deltaphi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltalambda/2) * Math.sin(deltalambda/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
}


/**
 * Returns the (initial) bearing from 'this' point to destination point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Initial bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
 *     var b1 = p1.bearingTo(p2); // b1.toFixed(1): 156.2
 */
LatLon.prototype.bearingTo = function(point) {
    var phi1 = this.lat.toRadians(), phi2 = point.lat.toRadians();
    var deltalambda = (point.lon-this.lon).toRadians();

    // see http://mathforum.org/library/drmath/view/55417.html
    var y = Math.sin(deltalambda) * Math.cos(phi2);
    var x = Math.cos(phi1)*Math.sin(phi2) -
            Math.sin(phi1)*Math.cos(phi2)*Math.cos(deltalambda);
    var angle = Math.atan2(y, x);

    return (angle.toDegrees()+360) % 360;
}


/**
 * Returns final bearing arriving at destination destination point from 'this' point; the final bearing
 * will differ from the initial bearing by varying degrees according to distance and latitude.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Final bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
 *     var b2 = p1.finalBearingTo(p2); // p2.toFixed(1): 157.9
 */
LatLon.prototype.finalBearingTo = function(point) {
    // get initial bearing from destination point to this point & reverse it by adding 180°
    return ( point.bearingTo(this)+180 ) % 360;
}


/**
 * Returns the midpoint between 'this' point and the supplied point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {LatLon} Midpoint between this point and the supplied point.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119), p2 = new LatLon(48.857, 2.351);
 *     var pMid = p1.midpointTo(p2); // pMid.toString(): 50.5363°N, 001.2746°E
 */
LatLon.prototype.midpointTo = function(point) {
    // see http://mathforum.org/library/drmath/view/51822.html for derivation

    var phi1 = this.lat.toRadians(), lambda1 = this.lon.toRadians();
    var phi2 = point.lat.toRadians();
    var deltalambda = (point.lon-this.lon).toRadians();

    var Bx = Math.cos(phi2) * Math.cos(deltalambda);
    var By = Math.cos(phi2) * Math.sin(deltalambda);

    var phi3 = Math.atan2(Math.sin(phi1)+Math.sin(phi2),
             Math.sqrt( (Math.cos(phi1)+Bx)*(Math.cos(phi1)+Bx) + By*By) );
    var lambda3 = lambda1 + Math.atan2(By, Math.cos(phi1) + Bx);
    lambda3 = (lambda3+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(phi3.toDegrees(), lambda3.toDegrees());
}


/**
 * Returns the destination point from 'this' point having travelled the given distance on the
 * given initial bearing (bearing normally varies around path followed).
 *
 * @param   {number} brng - Initial bearing in degrees.
 * @param   {number} dist - Distance in km (on sphere of 'this' radius).
 * @returns {LatLon} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.4778, -0.0015);
 *     var p2 = p1.destinationPoint(300.7, 7.794); // p2.toString(): 51.5135°N, 000.0983°W
 */
LatLon.prototype.destinationPoint = function(brng, dist) {
    // see http://williams.best.vwh.net/avform.htm#LL

    var angle = Number(brng).toRadians();
    var deltalower = Number(dist) / this.radius; // angular distance in radians

    var phi1 = this.lat.toRadians();
    var lambda1 = this.lon.toRadians();

    var phi2 = Math.asin( Math.sin(phi1)*Math.cos(deltalower) +
                        Math.cos(phi1)*Math.sin(deltalower)*Math.cos(angle) );
    var lambda2 = lambda1 + Math.atan2(Math.sin(angle)*Math.sin(deltalower)*Math.cos(phi1),
                             Math.cos(deltalower)-Math.sin(phi1)*Math.sin(phi2));
    lambda2 = (lambda2+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(phi2.toDegrees(), lambda2.toDegrees());
}


/**
 * Returns the point of intersection of two paths defined by point and bearing.
 *
 * @param   {LatLon} p1 - First point.
 * @param   {number} brng1 - Initial bearing from first point.
 * @param   {LatLon} p2 - Second point.
 * @param   {number} brng2 - Initial bearing from second point.
 * @returns {LatLon} Destination point (null if no unique intersection defined).
 *
 * @example
 *     var p1 = LatLon(51.8853, 0.2545), brng1 = 108.547;
 *     var p2 = LatLon(49.0034, 2.5735), brng2 =  32.435;
 *     var pInt = LatLon.intersection(p1, brng1, p2, brng2); // pInt.toString(): 50.9076°N, 004.5084°E
 */
LatLon.intersection = function(p1, brng1, p2, brng2) {
    // see http://williams.best.vwh.net/avform.htm#Intersection

    var phi1 = p1.lat.toRadians(), lambda1 = p1.lon.toRadians();
    var phi2 = p2.lat.toRadians(), lambda2 = p2.lon.toRadians();
    var angle13 = Number(brng1).toRadians(), angle23 = Number(brng2).toRadians();
    var deltaphi = phi2-phi1, deltalambda = lambda2-lambda1;

    var deltalower12 = 2*Math.asin( Math.sqrt( Math.sin(deltaphi/2)*Math.sin(deltaphi/2) +
        Math.cos(phi1)*Math.cos(phi2)*Math.sin(deltalambda/2)*Math.sin(deltalambda/2) ) );
    if (deltalower12 == 0) return null;

    // initial/final bearings between points
    var angle1 = Math.acos( ( Math.sin(phi2) - Math.sin(phi1)*Math.cos(deltalower12) ) /
                        ( Math.sin(deltalower12)*Math.cos(phi1) ) );
    if (isNaN(angle1)) angle1 = 0; // protect against rounding
    var angle2 = Math.acos( ( Math.sin(phi1) - Math.sin(phi2)*Math.cos(deltalower12) ) /
                        ( Math.sin(deltalower12)*Math.cos(phi2) ) );

    if (Math.sin(lambda2-lambda1) > 0) {
        var angle12 = angle1;
        var angle21 = 2*Math.PI - angle2;
    } else {
        var angle12 = 2*Math.PI - angle1;
        var angle21 = angle2;
    }

    var alpha1 = (angle13 - angle12 + Math.PI) % (2*Math.PI) - Math.PI; // angle 2-1-3
    var alpha2 = (angle21 - angle23 + Math.PI) % (2*Math.PI) - Math.PI; // angle 1-2-3

    if (Math.sin(alpha1)==0 && Math.sin(alpha2)==0) return null; // infinite intersections
    if (Math.sin(alpha1)*Math.sin(alpha2) < 0) return null;      // ambiguous intersection

    //alpha1 = Math.abs(alpha1);
    //alpha2 = Math.abs(alpha2);
    // ... Ed Williams takes abs of alpha1/alpha2, but seems to break calculation?

    var alpha3 = Math.acos( -Math.cos(alpha1)*Math.cos(alpha2) +
                         Math.sin(alpha1)*Math.sin(alpha2)*Math.cos(deltalower12) );
    var deltalower13 = Math.atan2( Math.sin(deltalower12)*Math.sin(alpha1)*Math.sin(alpha2),
                          Math.cos(alpha2)+Math.cos(alpha1)*Math.cos(alpha3) )
    var phi3 = Math.asin( Math.sin(phi1)*Math.cos(deltalower13) +
                        Math.cos(phi1)*Math.sin(deltalower13)*Math.cos(angle13) );
    var deltalambda13 = Math.atan2( Math.sin(angle13)*Math.sin(deltalower13)*Math.cos(phi1),
                           Math.cos(deltalower13)-Math.sin(phi1)*Math.sin(phi3) );
    var lambda3 = lambda1 + deltalambda13;
    lambda3 = (lambda3+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(phi3.toDegrees(), lambda3.toDegrees());
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Returns the distance travelling from 'this' point to destination point along a rhumb line.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Distance in km between this point and destination point (on sphere of 'this' radius).
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338), p2 = new LatLon(50.964, 1.853);
 *     var d = p1.distanceTo(p2); // d.toPrecision(4): 40.31
 */
LatLon.prototype.rhumbDistanceTo = function(point) {
    // see http://williams.best.vwh.net/avform.htm#Rhumb

    var R = this.radius;
    var phi1 = this.lat.toRadians(), phi2 = point.lat.toRadians();
    var deltaphi = phi2 - phi1;
    var deltalambda = Math.abs(point.lon-this.lon).toRadians();
    // if dLon over 180° take shorter rhumb line across the anti-meridian:
    if (Math.abs(deltalambda) > Math.PI) deltalambda = deltalambda>0 ? -(2*Math.PI-deltalambda) : (2*Math.PI+deltalambda);

    // on Mercator projection, longitude distances shrink by latitude; q is the 'stretch factor'
    // q becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it
    var deltapsi = Math.log(Math.tan(phi2/2+Math.PI/4)/Math.tan(phi1/2+Math.PI/4));
    var q = Math.abs(deltapsi) > 10e-12 ? deltaphi/deltapsi : Math.cos(phi1);

    // distance is pythagoras on 'stretched' Mercator projection
    var deltalower = Math.sqrt(deltaphi*deltaphi + q*q*deltalambda*deltalambda); // angular distance in radians
    var dist = deltalower * R;

    return dist;
}


/**
 * Returns the bearing from 'this' point to destination point along a rhumb line.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338), p2 = new LatLon(50.964, 1.853);
 *     var d = p1.rhumbBearingTo(p2); // d.toFixed(1): 116.7
 */
LatLon.prototype.rhumbBearingTo = function(point) {
    var phi1 = this.lat.toRadians(), phi2 = point.lat.toRadians();
    var deltalambda = (point.lon-this.lon).toRadians();
    // if dLon over 180° take shorter rhumb line across the anti-meridian:
    if (Math.abs(deltalambda) > Math.PI) deltalambda = deltalambda>0 ? -(2*Math.PI-deltalambda) : (2*Math.PI+deltalambda);

    var deltapsi = Math.log(Math.tan(phi2/2+Math.PI/4)/Math.tan(phi1/2+Math.PI/4));

    var angle = Math.atan2(deltalambda, deltapsi);

    return (angle.toDegrees()+360) % 360;
}


/**
 * Returns the destination point having travelled along a rhumb line from 'this' point the given
 * distance on the  given bearing.
 *
 * @param   {number} brng - Bearing in degrees from north.
 * @param   {number} dist - Distance in km (on sphere of 'this' radius).
 * @returns {LatLon} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = p1.rhumbDestinationPoint(116.7, 40.31); // p2.toString(): 50.9641°N, 001.8531°E
 */
LatLon.prototype.rhumbDestinationPoint = function(brng, dist) {
    var deltalower = Number(dist) / this.radius; // angular distance in radians
    var phi1 = this.lat.toRadians(), lambda1 = this.lon.toRadians();
    var angle = Number(brng).toRadians();

    var deltaphi = deltalower * Math.cos(angle);

    var phi2 = phi1 + deltaphi;
    // check for some daft bugger going past the pole, normalise latitude if so
    if (Math.abs(phi2) > Math.PI/2) phi2 = phi2>0 ? Math.PI-phi2 : -Math.PI-phi2;

    var deltapsi = Math.log(Math.tan(phi2/2+Math.PI/4)/Math.tan(phi1/2+Math.PI/4));
    var q = Math.abs(deltapsi) > 10e-12 ? deltaphi / deltapsi : Math.cos(phi1); // E-W course becomes ill-conditioned with 0/0

    var deltalambda = deltalower*Math.sin(angle)/q;

    var lambda2 = lambda1 + deltalambda;

    lambda2 = (lambda2 + 3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(phi2.toDegrees(), lambda2.toDegrees());
}


/**
 * Returns the loxodromic midpoint (along a rhumb line) between 'this' point and second point.
 *
 * @param   {LatLon} point - Latitude/longitude of second point.
 * @returns {LatLon} Midpoint between this point and second point.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338), p2 = new LatLon(50.964, 1.853);
 *     var p2 = p1.rhumbMidpointTo(p2); // p2.toString(): 51.0455°N, 001.5957°E
 */
LatLon.prototype.rhumbMidpointTo = function(point) {
    // http://mathforum.org/kb/message.jspa?messageID=148837

    var phi1 = this.lat.toRadians(), lambda1 = this.lon.toRadians();
    var phi2 = point.lat.toRadians(), lambda2 = point.lon.toRadians();

    if (Math.abs(lambda2-lambda1) > Math.PI) lambda1 += 2*Math.PI; // crossing anti-meridian

    var phi3 = (phi1+phi2)/2;
    var f1 = Math.tan(Math.PI/4 + phi1/2);
    var f2 = Math.tan(Math.PI/4 + phi2/2);
    var f3 = Math.tan(Math.PI/4 + phi3/2);
    var lambda3 = ( (lambda2-lambda1)*Math.log(f3) + lambda1*Math.log(f2) - lambda2*Math.log(f1) ) / Math.log(f2/f1);

    if (!isFinite(lambda3)) lambda3 = (lambda1+lambda2)/2; // parallel of latitude

    lambda3 = (lambda3 + 3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180º

    return new LatLon(phi3.toDegrees(), lambda3.toDegrees());
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Returns a string representation of 'this' point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use - default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated latitude/longitude.
 */
LatLon.prototype.toString = function(format, dp) {
    if (typeof format == 'undefined') format = 'dms';

    // return Geo.toLat(this.lat, format, dp) + ', ' + Geo.toLon(this.lon, format, dp);
    return "("+this.lat+", "+this.lon+")";
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/** Extend Number object with method to convert numeric degrees to radians */
if (typeof Number.prototype.toRadians == 'undefined') {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; }
}


/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (typeof Number.prototype.toDegrees == 'undefined') {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; }
}
