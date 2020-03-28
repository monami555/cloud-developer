import { add, divide, conc } from './units';

import { expect } from 'chai';
import 'mocha';

describe('add function', () => {

  it('should add two and two', () => {
    const result = add(2,2);
    expect(result).to.equal(4);
  });

  it('should add -2 and two', () => {
    const result = add(-2,2);
    expect(result).to.equal(0);
  });

});

describe('divide', () => {

  it('should divide 6 by 3', () => {
    const result = divide(6,3);
    expect(result).to.equal(2);
  });

  it('should divide 5 and 2', () => {
    const result = divide(5,2);
    expect(result).to.equal(2.5);
  });

  it('should throw an error if div by zero', () => {
    expect(()=>{ divide(5,0) }).to.throw('div by 0')
  });

});

// @TODO try creating a new describe block for the "concat" method
// it should contain an it block for each it statement in the units.ts @TODO.
// don't forget to import the method ;)

describe('concat strings', () => {

  it('should add strings', () => {
    const result = conc("aa","bb");
    expect(result).to.equal("aabb");
  });

  it('should throw error if s1 empty', () => {
    expect(()=>{conc("","bb")}).to.throw("s1 missing");
  });

  it('should throw error if s2 empty', () => {
    expect(()=>{conc("aa","")}).to.throw("s2 missing");
  });

  it('should throw error if s1 null', () => {
    expect(()=>{conc(null,"bb")}).to.throw("s1 missing");
  });

  it('should throw error if s2 null', () => {
    expect(()=>{conc("aa",null)}).to.throw("s2 missing");
  });

});