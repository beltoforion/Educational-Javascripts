var Vector = function(x, y) {
	this.x = x;
	this.y = y;
};

Vector.prototype.clone = function() {
	return new Vector(this.x, this.y);
}

Vector.prototype.length = function() {
	return Math.sqrt(this.x*this.x + this.y*this.y);
}

Vector.prototype.lengthSqr = function() {
	return this.x * this.x + this.y * this.y;
}

Vector.prototype.add = function(v) {
	this.x += v.x;
	this.y += v.y;
	return this;
}

Vector.prototype.subtract = function(v) {
	this.x -= v.x;
	this.y -= v.y;
	return this;
}

Vector.prototype.rotate = function(angle) {
        var fi = angle*Math.PI/180;
        this.x = this.x*Math.cos(fi) - this.y*Math.sin(fi);
        this.y = this.x*Math.sin(fi) + this.y*Math.cos(fi);
	return this;
}

Vector.prototype.orthoNormal = function() {
	var ret = new Vector(this.y, this.x);
	return ret.multiplyScalar(ret.length());
}

// Angle towards the positive y axis in radians
Vector.prototype.verticalAngle = function() {
	return Math.PI - Math.atan2(this.x, this.y);
}

// Angle towards the positive y axis in radians
Vector.prototype.verticalAngleDeg = function() {
	return this.verticalAngle() * 180.0 / Math.PI;
}

Vector.prototype.addXY = function(x, y) {
	this.x += x;
	this.y += y;
	return this;
}

Vector.prototype.normalize = function() {
	var l = this.length();
	this.divideValue(l);
	return this;
}

Vector.prototype.multiplyValue = function(s) {
	this.x *= s;
	this.y *= s;
	return this;
}

Vector.prototype.divideValue = function(s) {
	this.x /= s;
	this.y /= s;
	return this;
}

//-------------------------------------------------------------------------------------------------
// Static functions that do not alter the arguments
//-------------------------------------------------------------------------------------------------

Vector.prototype.rotateEx = function(angle) {
        var fi = angle*Math.PI/180;
        var v = new Vector(this.x*Math.cos(fi) - this.y*Math.sin(fi),
                           this.x*Math.sin(fi) + this.y*Math.cos(fi));
	return v;
}

Vector.subtractEx = function(v1, v2) {
	return new Vector(v1.x - v2.x, v1.y - v2.y);
}

Vector.addEx = function(v1, v2) {
	return new Vector(v1.x + v2.x, v1.y + v2.y);
}

