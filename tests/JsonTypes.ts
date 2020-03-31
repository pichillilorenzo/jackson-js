import test from 'ava';
import {
  JsonIgnore,
  JsonClass,
  ObjectMapper,
  JsonTypeInfo,
  JsonTypeInfoId,
  JsonTypeInfoAs,
  JsonSubTypes,
  JsonTypeName
} from '../src';

test('@JsonTypeInfo with JsonTypeInfoAs.PROPERTY', t => {
  @JsonTypeInfo({
    use: JsonTypeInfoId.NAME,
    include: JsonTypeInfoAs.PROPERTY
  })
  @JsonSubTypes({
    types: [
      {class: () => Dog, name: 'dog'},
      {class: () => Cat, name: 'cat'},
    ]
  })
  class Animal {
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  @JsonTypeName({value: 'dog'})
  class Dog extends Animal {

  }

  @JsonTypeName({value: 'cat'})
  class Cat extends Animal {

  }

  const dog = new Dog('Arthur');
  const cat = new Cat('Merlin');

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Array<any>>([dog, cat]);
  t.is(jsonData, '[{"name":"Arthur","@type":"Dog"},{"name":"Merlin","@type":"Cat"}]');

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});

test('@JsonTypeInfo with JsonTypeInfoAs.PROPERTY and custom property value', t => {
  @JsonTypeInfo({
    use: JsonTypeInfoId.NAME,
    include: JsonTypeInfoAs.PROPERTY,
    property: 'myType'
  })
  @JsonSubTypes({
    types: [
      {class: () => Dog, name: 'dog'},
      {class: () => Cat, name: 'cat'},
    ]
  })
  class Animal {
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  @JsonTypeName({value: 'dog'})
  class Dog extends Animal {

  }

  @JsonTypeName({value: 'cat'})
  class Cat extends Animal {

  }

  const dog = new Dog('Arthur');
  const cat = new Cat('Merlin');

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Array<any>>([dog, cat]);
  t.is(jsonData, '[{"name":"Arthur","myType":"Dog"},{"name":"Merlin","myType":"Cat"}]');

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});

test('@JsonTypeInfo with JsonTypeInfoAs.WRAPPER_OBJECT', t => {
  @JsonTypeInfo({
    use: JsonTypeInfoId.NAME,
    include: JsonTypeInfoAs.WRAPPER_OBJECT
  })
  @JsonSubTypes({
    types: [
      {class: () => Dog, name: 'dog'},
      {class: () => Cat, name: 'cat'},
    ]
  })
  class Animal {
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  @JsonTypeName({value: 'dog'})
  class Dog extends Animal {

  }

  @JsonTypeName({value: 'cat'})
  class Cat extends Animal {

  }

  const dog = new Dog('Arthur');
  const cat = new Cat('Merlin');

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Array<any>>([dog, cat]);
  t.is(jsonData, '[{"Dog":{"name":"Arthur"}},{"Cat":{"name":"Merlin"}}]');

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});

test('@JsonTypeInfo with JsonTypeInfoAs.WRAPPER_ARRAY', t => {
  @JsonTypeInfo({
    use: JsonTypeInfoId.NAME,
    include: JsonTypeInfoAs.WRAPPER_ARRAY
  })
  @JsonSubTypes({
    types: [
      {class: () => Dog, name: 'dog'},
      {class: () => Cat, name: 'cat'},
    ]
  })
  class Animal {
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  @JsonTypeName({value: 'dog'})
  class Dog extends Animal {

  }

  @JsonTypeName({value: 'cat'})
  class Cat extends Animal {

  }

  const dog = new Dog('Arthur');
  const cat = new Cat('Merlin');

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Array<any>>([dog, cat]);
  t.is(jsonData, '[["Dog",{"name":"Arthur"}],["Cat",{"name":"Merlin"}]]');

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});
