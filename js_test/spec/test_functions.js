/**
 * Test callback functions used in d3 visualization
*/
describe('test functions for d3 force directed visualization', () => {

    before(function() {
        this.server = sinon.fakeServer.create();
        this.server.respondWith("GET", "/people/nodes.json",
           [200, { "Content-Type": "application/json" },
            '{"nodes": [{"id": "Gaius Plinius Secundus", "group": 9}, {"id":'+
            ' "Cornelius Tacitus", "group": 4}], "links": [{"source": "Gaius' +
            ' Plinius Secundus", "target": "Cornelius Tacitus", "weight": 11}]}'
            ]);
        this.server.autoRespond = true
    });

    after(function() {
        this.server.restore();
    });

    it('should use setcolor() to define the color for nodes', function() {
        const colors = {
            0: 'gray',
            1: 'aquamarine',
            2: 'green',
            3: 'purple',
            4: 'indigo',
            9: 'red',
        };
        for (i in colors) {
            d = {}
            d.group = i
            setcolor(d).should.equal(colors[i]);
        }

    });
    it("should use dragstarted() to denote a drag event starting", function () {
        d = {};
        d.x = 1;
        d.y = 2;
        d3.event = {'active': true}

        dragstarted(d);
        d.fx.should.equal(1);
        d.fy.should.equal(2);


    });
    it("should use dragged() to a node being dragged", function() {
        d = {}
        d3.event = {}
        d3.event.x = 1;
        d3.event.y = 2;
        dragged(d);
        d.fx.should.equal(1);
        d.fy.should.equal(2);
    });

    it("should use dragended() to a drag event stopping", function() {
        d = {'fx': 1, 'fy': 2}
        d3.event = {'active': true}

        dragended(d);
        var should = chai.should();
        should.not.exist(d.fx);
        should.not.exist(d.fy);
    });

    it("should make an XHR call when invoked", function() {
        calld3ForceDirected();
        const requestArray = this.server.requests;
        requestArray.length.should.equal(1);
        requestArray[0].url.should.equal("/people/nodes.json");

    });

});