const e = Math.exp(1);

class ConstantFunctions {
	/**
	 * Creates an instace of the constant functions
	 * that will be used during simulation and setting payoffs
	 * @constructor
	 */
	constructor(){
		this.G = undefined;
		this.d = undefined;
		this.dist = undefined;
		this.steepness = 20;
		this.inflexiosPontHelye = 0.5;
		this.shapeOfDif = 1/2;
		this.z = 3;
	}

	/**
	 * On value change of `dist`, d is recalculated
	 * `G` is also recalculated
	 */
	set ['distance'](val){
		this.d = val * this.shapeOfDif;
		this.dist = val;
		this.calculateDiffGradient();
	}

	/**
	 * Sigmoid function - see ConstantFunctions.V function
	 * @returns {float}
	 */
	g(i) {
		return 1 / (1 + Math.pow(e, (-this.z * (i - this.d) / this.dist)));
	}

	/**
	 * Builds a up an array that is used at the distance calculation
	 * @param {int} dist - distance that will be used during this simulation
	 */
	calculateDiffGradient() {
		this.G = new Array(this.dist);
		this.G[0] = 1;
		for (var i = 1; i < this.dist; ++i) {
			this.G[i] = 1 - ( ( this.g(i) - this.g(0) ) / ( this.g(this.dist) - this.g(0) ) );
		}
	}

	/**
	 * Sigmoid function used here - see Cooperation among cancer cells as public goods games on Voronoi networks - Marco Archetti
	 * @returns {float}
	 */
	V(i, neighborsCount) {
		return 1 / (1 + Math.pow(e, (-this.steepness * (i - this.inflexiosPontHelye)) / neighborsCount));
	}

	/**
	 * Function used for calculating the actual payoff value
	 *
	 * @param {int} 	cooperatingNeighborsCount
	 * @param {float} cost
	 * @param {int} 	neighborsCount
	 * @returns {float} payoff
	 */
	payoff(cooperatingNeighborsCount, cost, neighborsCount) {
		return (this.V(cooperatingNeighborsCount, neighborsCount) - this.V(0, neighborsCount)) / (this.V(neighborsCount, neighborsCount) - this.V(0, neighborsCount)) - cost;
	}

}

module.exports = ConstantFunctions;