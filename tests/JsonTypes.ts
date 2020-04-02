import test from 'ava';
import {JsonTypeName} from '../src/annotations/JsonTypeName';
import {JsonSubTypes} from '../src/annotations/JsonSubTypes';
import {JsonTypeInfo, JsonTypeInfoAs, JsonTypeInfoId} from '../src/annotations/JsonTypeInfo';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonTypeId} from '../src/annotations/JsonTypeId';
import {JacksonError} from '../src/core/JacksonError';
import {JsonClass} from "../src/annotations/JsonClass";

test('@JsonTypeInfo with JsonTypeInfoAs.PROPERTY without subtypes name', t => {
  @JsonTypeInfo({
    use: JsonTypeInfoId.NAME,
    include: JsonTypeInfoAs.PROPERTY
  })
  @JsonSubTypes({
    types: [
      {class: () => Dog},
      {class: () => Cat},
    ]
  })
  class Animal {
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {

  }

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

test('@JsonTypeInfo at class field level with JsonTypeInfoAs.PROPERTY without subtypes name', t => {
  class Zoo {
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.PROPERTY
    })
    @JsonSubTypes({
      types: [
        {class: () => Dog},
        {class: () => Cat},
      ]
    })
    @JsonClass({class: () => [Array, [Animal]]})
    animals: Animal[] = [];
  }

  class Animal {
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonClass({class: () => [Dog]})
    father: Dog;
    @JsonClass({class: () => [Dog]})
    mother: Dog;
  }

  class Cat extends Animal {

  }

  const zoo = new Zoo();
  const dog = new Dog('Arthur');
  const fatherDog = new Dog('Buddy');
  const motherDog = new Dog('Coco');
  dog.father = fatherDog;
  dog.mother = motherDog;
  const cat = new Cat('Merlin');
  zoo.animals.push(dog, cat);

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Zoo>(zoo);
  // eslint-disable-next-line max-len
  t.is(jsonData, '{"animals":[{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"},"@type":"Dog"},{"name":"Merlin","@type":"Cat"}]}');

  const zooParsed = objectMapper.parse<Zoo>(jsonData, {mainCreator: () => [Zoo]});
  t.assert(zooParsed instanceof Zoo);
  t.is(zooParsed.animals.length, 2);
  t.assert(zooParsed.animals[0] instanceof Dog);
  t.is(zooParsed.animals[0].name, 'Arthur');
  t.assert((zooParsed.animals[0] as Dog).father instanceof Dog);
  t.is((zooParsed.animals[0] as Dog).father.name, 'Buddy');
  t.assert((zooParsed.animals[0] as Dog).mother instanceof Dog);
  t.is((zooParsed.animals[0] as Dog).mother.name, 'Coco');
  t.assert(zooParsed.animals[1] instanceof Cat);
  t.is(zooParsed.animals[1].name, 'Merlin');
});

test('@JsonTypeInfo with JsonTypeInfoAs.PROPERTY with subtypes name', t => {
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
  t.is(jsonData, '[{"name":"Arthur","@type":"dog"},{"name":"Merlin","@type":"cat"}]');

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});

test('@JsonTypeInfo with JsonTypeInfoAs.PROPERTY with @JsonTypeId', t => {
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
    @JsonTypeId()
    typeId: string;
  }

  @JsonTypeName({value: 'cat'})
  class Cat extends Animal {
    @JsonTypeId()
    getTypeId(): string {
      return 'CatTypeId';
    }
  }


  const dog = new Dog('Arthur');
  dog.typeId = 'DogTypeId';

  const cat = new Cat('Merlin');

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Array<any>>([dog, cat]);
  t.is(jsonData, '[{"DogTypeId":{"name":"Arthur"}},{"CatTypeId":{"name":"Merlin"}}]');

  const err1 = t.throws<JacksonError>(() => {
    objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  });

  t.assert(err1 instanceof JacksonError);

  const err2 = t.throws<JacksonError>(() => {
    // eslint-disable-next-line max-len
    objectMapper.parse<Array<Animal>>('[{"dog":{"name":"Arthur"}},{"CatTypeId":{"name":"Merlin"}}]', {mainCreator: () => [Array, [Animal]]});
  });

  t.assert(err2 instanceof JacksonError);

  const err3 = t.throws<JacksonError>(() => {
    // eslint-disable-next-line max-len
    objectMapper.parse<Array<Animal>>('[{"DogTypeId":{"name":"Arthur"}},{"cat":{"name":"Merlin"}}]', {mainCreator: () => [Array, [Animal]]});
  });

  t.assert(err3 instanceof JacksonError);

  // eslint-disable-next-line max-len
  const animals = objectMapper.parse<Array<Animal>>('[{"dog":{"name":"Arthur"}},{"cat":{"name":"Merlin"}}]', {mainCreator: () => [Array, [Animal]]});
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
  t.is(jsonData, '[{"name":"Arthur","myType":"dog"},{"name":"Merlin","myType":"cat"}]');

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
  t.is(jsonData, '[{"dog":{"name":"Arthur"}},{"cat":{"name":"Merlin"}}]');

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
  t.is(jsonData, '[["dog",{"name":"Arthur"}],["cat",{"name":"Merlin"}]]');

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});
