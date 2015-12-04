import chai from 'chai';
import Kudu from 'kudu';
import BaseModel from '../src/model';

let expect = chai.expect;

describe('Kudu BaseModel', () => {

  let kudu;

  beforeEach(() => {
    kudu = new Kudu();
  });

  describe('instances', () => {

    let Model;
    let Child;

    beforeEach(() => {
      Child = kudu.createModel('child', {});
      Model = kudu.createModel('test', {
        relationships: {
          child: { type: 'child' },
          children: { type: 'child', hasMany: true },
        },
      });
    });

    it('should inherit from the base Model constructor', () => {
      expect(new Model()).to.be.an.instanceOf(BaseModel);
    });

    it('should map provided data onto the instance', () => {
      expect(new Model({ id: 1 })).to.have.property('id', 1);
    });

    it('should handle nested model instances based on relationships', () => {
      expect(new Model({ id: 1, child: { id: 2 } })).to.have.property('child')
        .that.is.an.instanceOf(Child);
    });

    it('should handle arrays of nested instances based on relationships', () => {
      let instance = new Model({ id: 1, children: [ { id: 2 } ] });
      expect(instance.children[ 0 ]).to.be.an.instanceOf(Child);
    });
  });

  describe('#toJSON', () => {

    let Model;
    let instance;

    beforeEach(() => {
      Model = kudu.createModel('test', {
        properties: {
          name: {
            type: String,
            required: true,
          },
        },
      });
      instance = new Model({ type: 'test', name: 'test' });
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
