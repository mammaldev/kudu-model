import chai from 'chai';
import BaseModel from '../src/model';

let expect = chai.expect;

describe('Kudu BaseModel', () => {

  let MockApp;
  let Model;
  let Child;
  let app;

  beforeEach(() => {

    Child = class extends BaseModel {

      static schema = {
        properties: {
          defaults: {
            type: String,
            default: 'default',
          },
        },
      };
    };

    Model = class extends BaseModel {

      static schema = {
        relationships: {
          child: { type: 'child' },
          children: { type: 'child', hasMany: true },
        },
      };
    };

    MockApp = class {
      getModel( type ) {
        if ( type === 'child' ) {
          return Child;
        }
      }
    };

    app = new MockApp();
  });

  describe('instances', () => {

    it('should expose a reference to the Kudu app', () => {
      expect(new Model(app)).to.have.property('app', app);
    });

    it('should map provided data onto the instance', () => {
      expect(new Model(app, { id: 1 })).to.have.property('id', 1);
    });

    it('should default unprovided data where possible', () => {
      expect(new Child(app)).to.have.property('defaults', 'default');
    });

    it('should handle nested model instances based on relationships', () => {
      expect(new Model(app, { id: 1, child: { id: 2 } })).to.have.property('child')
        .that.is.an.instanceOf(Child);
    });

    it('should handle arrays of nested instances based on relationships', () => {
      let instance = new Model(app, { id: 1, children: [ { id: 2 } ] });
      expect(instance.children[ 0 ]).to.be.an.instanceOf(Child);
    });
  });

  describe('#toJSON', () => {

    let instance;

    beforeEach(() => {
      instance = new Model(app, { type: 'test', name: 'test' });
    });

    it('should remove the reference to the Kudu app from the instance', () => {
      expect(instance.toJSON()).not.to.have.property('app');
    });

    it('should allow serialisation of the resulting object', () => {
      expect(JSON.stringify(instance.toJSON())).to.be.a('string');
    });

    it('should not affect the original instance', () => {
      instance.toJSON();
      expect(instance).to.have.property('app');
    });
  });
});
