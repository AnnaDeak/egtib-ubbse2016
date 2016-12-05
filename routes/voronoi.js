  /**
 * Created by rekaszilagyi on 2016-11-13.
 */
const router = require('express').Router();
const Voronoi = require('./module.voronoi');

const voronoi = new Voronoi();
const e = Math.exp(1);
const cooperatingCost = 0.5;
const defectingCost = 0;

var diagram;

let bbox;
let sites;
let initialSize;
let cellakSzama;
let inflexiosPontHelye;
let Vn;
let V0;

router.use(function(req, res, next) {
  //Always runs before any code
  console.log(req.session.v);
  let v = req.session.v;
  if (!v) {
    //Init the voronoi for every call from unknown source
    v = req.session.v = {};
    initialSize = v.initialSize = {
      x: 1360,
      y: 680
    };
    bbox = v.bbox = {
      xl: 0,
      xr: 800,
      yt: 0,
      yb: 600
    };
    sites = v.sites = [];
    Vn = v.Vn = 0;
    V0 = v.V0 = 0;
    cellakSzama = v.cellakSzama = 0;
    inflexiosPontHelye = v.inflexiosPontHelye = 2.5;
    initVoronoi();
    diagram = voronoi.compute(sites, bbox);
    setPayoffs();
  }
  else {
    v = req.session.v;
    initialSize = v.initialSize;
    bbox = v.bbox;
    sites = v.sites;
    Vn = v.Vn;
    V0 = v.V0;
    cellakSzama = v.cellakSzama;
    inflexiosPontHelye = v.inflexiosPontHelye;
    diagram = voronoi.compute(sites, bbox);
    setPayoffs();
  }
  console.log(req.session.v.sites[0]);
  next(); //pass control to next handler
});

router.get('/', function(req, res) {
  res.render('voronoi', {
    sites: sites
  });
});

router.get('/data', function(req, res) {
  res.send(JSON.stringify(simulate()));
});

router.post('/init', function(req, res){
  console.log(req.session.v.sites[0]);
  v = req.session.v;
  bbox = v.bbox = req.body.bbox;
  sites = v.sites = [];

  let badlyFormattedSites = req.body.sites;
  for (let i = 0; i < badlyFormattedSites.length; ++i){
    site = badlyFormattedSites[i];
    let cost = undefined;
    if (site.attrib == 'c')
      cost = cooperatingCost;
    else
      cost = defectingCost;
    sites.push({
      x: parseFloat(site.x),
      y: parseFloat(site.y),
      attrib: site.attrib,
      cost: cost,
      payoff: undefined
    })
  }

  cellakSzama = v.cellakSzama = sites.length;
  diagram = voronoi.compute(sites, bbox);
  setPayoffs();
  console.log(req.session.v.sites[0]);
});

function initVoronoi(){
  //Can be used only when everything is set beforehand
  for (var i = 0; i < initialSize.x; i += 100) {
    for (var j = 0; j < initialSize.y; j += 100) {
      if (Math.random() <= 0.95) {
        attrib = 'c';
        cost = cooperatingCost;
      } else {
        attrib = 'd';
        cost = defectingCost;
      }
      sites.push({
        x: i,
        y: j,
        attrib: attrib,
        cost: cost,
        payoff: undefined
      });
    }
  }
  cellakSzama = sites.length;
  Vn = V(sites.length);
  V0 = V(0);
}

function simulate() {
  var ret = [];
  for (var j = 0; j < sites.length; ++j) {
    var i = Math.floor(Math.random() * sites.length);
    //Get 'c' neighbors
    var neighbors = getNeighbors(sites[i], diagram);
    var cooperatingNeighbors = 0;
    for (var k = 0; k < neighbors.length; ++k) {
      if (neighbors[k].attrib == 'c')
        ++cooperatingNeighbors;
    }
    //Calculate the payoff if not defined yet
    neighbors = getNeighbors(sites[i], diagram);
    var k = Math.floor(Math.random() * neighbors.length);
    if (k == 0) //why can this happen? NO NEIGHBORS
      continue;
    if (neighbors[k].payoff > sites[i].payoff) {
      sites[i].attrib = neighbors[k].attrib;
      sites[i].cost = neighbors[k].cost;
      setPayoffs();
    }
    ret.push(JSON.parse(JSON.stringify(sites)));
  }
  return ret;
}

function setPayoffs() {
  for (var i = 0; i < sites.length; ++i) {
    //Get 'c' neighbors
    var neighbors = getNeighbors(sites[i], diagram);
    var cooperatingNeighbors = 0;
    for (var j = 0; j < neighbors.length; ++j) {
      if (neighbors[j].attrib == 'c')
        ++cooperatingNeighbors;
    }
    //Calculate the payoff
    sites[i].payoff = payoff(cooperatingNeighbors, sites[i].cost);
  }
}

function payoff(cooperatingNeighborsCount, cost) {
  return (V(cooperatingNeighborsCount) - V0) / (Vn - V0) - cost;
}

function V(i) {
  //s = 2 ---> ?
  return 1 / (1 + Math.pow(e, (-2 * (i - inflexiosPontHelye)) / cellakSzama));
}

function getNeighbors(p, diagram) {
  //find neighbors of cell which has site at p point
  var neighbors = [];
  halfedges = getCellBySite(p, diagram.cells).halfedges;
  for (var i in halfedges) {
    var lsite = halfedges[i].edge.lSite
    if (lsite != null && !compareSites(lsite, p)) neighbors.push(lsite);
    var rsite = halfedges[i].edge.rSite
    if (rsite != null && !compareSites(rsite, p)) neighbors.push(rsite);
  }
  return neighbors;
}

function getCellBySite(point, cells) {
  //returns the cell which site is equal to point
  for (var i in cells) {
    if (compareSites(cells[i].site, point)) return cells[i];
  }
}

function compareSites(s1, s2) {
  if (s1.x == s2.x && s1.y == s2.y) return true;
  return false;
}

module.exports = router;
