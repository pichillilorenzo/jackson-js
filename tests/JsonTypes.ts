import test from 'ava';
import {JsonTypeName} from '../src/decorators/JsonTypeName';
import {JsonSubTypes} from '../src/decorators/JsonSubTypes';
import {JsonTypeInfo, JsonTypeInfoAs, JsonTypeInfoId} from '../src/decorators/JsonTypeInfo';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonTypeId} from '../src/decorators/JsonTypeId';
import {JacksonError} from '../src/core/JacksonError';
import {JsonClassType} from '../src/decorators/JsonClassType';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {
  ClassType,
  JsonParserTransformerContext,
  JsonStringifierTransformerContext,
  TypeIdResolver
} from '../src/@types';
import {JsonTypeIdResolver} from '../src/decorators/JsonTypeIdResolver';
import {JsonGetter} from '../src/decorators/JsonGetter';
import {JsonSetter} from '../src/decorators/JsonSetter';

test('@JsonTypeInfo and @JsonSubTypes at class level with JsonTypeInfoAs.PROPERTY without subtypes name', t => {
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
    @JsonProperty() @JsonClassType({type: () => [String]})
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
  const jsonData = objectMapper.stringify<Array<Animal>>([dog, cat]);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('[{"name":"Arthur","@type":"Dog"},{"name":"Merlin","@type":"Cat"}]'));

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});

test('@JsonTypeInfo at class level with JsonTypeInfoAs.PROPERTY without subtypes name and using a custom @JsonTypeIdResolver', t => {
  class CustomTypeIdResolver implements TypeIdResolver {
    idFromValue(obj: any, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): string {
      if (obj instanceof Dog) {
        return 'animalDogType';
      } else if (obj instanceof Cat) {
        return 'animalCatType';
      }
      return null;
    }
    typeFromId(id: string, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): ClassType<any> {
      switch (id) {
      case 'animalDogType':
        return Dog;
      case 'animalCatType':
        return Cat;
      }
      return null;
    };
  }

  @JsonTypeInfo({
    use: JsonTypeInfoId.NAME,
    include: JsonTypeInfoAs.PROPERTY
  })
  @JsonTypeIdResolver({resolver: new CustomTypeIdResolver()})
  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
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
  const jsonData = objectMapper.stringify<Array<Animal>>([dog, cat]);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('[{"name":"Arthur","@type":"animalDogType"},{"name":"Merlin","@type":"animalCatType"}]'));

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});

test('@JsonTypeInfo and @JsonSubTypes at property level with JsonTypeInfoAs.PROPERTY without subtypes name', t => {
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
    @JsonProperty()
    @JsonClassType({type: () => [Array, [Animal]]})
    animals: Animal[] = [];
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"animals":[{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"},"@type":"Dog"},{"name":"Merlin","@type":"Cat"}]}'));

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

test('@JsonTypeInfo and @JsonSubTypes at method level with JsonTypeInfoAs.PROPERTY without subtypes name', t => {
  class Zoo {
    @JsonProperty()
    @JsonClassType({type: () => [Array, [Animal]]})
    animals: Animal[] = [];

    @JsonGetter()
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
    @JsonClassType({type: () => [Array, [Animal]]})
    getAnimals(): Animal[] {
      return this.animals;
    }

    @JsonSetter()
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
    setAnimals(@JsonClassType({type: () => [Array, [Animal]]}) animals) {
      this.animals = animals;
    }
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {

  }

  class Cat extends Animal {

  }

  const zoo = new Zoo();
  const dog = new Dog('Arthur');
  const cat = new Cat('Merlin');
  zoo.animals.push(dog, cat);

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Zoo>(zoo);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"animals":[{"name":"Arthur","@type":"Dog"},{"name":"Merlin","@type":"Cat"}]}'));

  const zooParsed = objectMapper.parse<Zoo>(jsonData, {mainCreator: () => [Zoo]});
  t.assert(zooParsed instanceof Zoo);
  t.is(zooParsed.animals.length, 2);
  t.assert(zooParsed.animals[0] instanceof Dog);
  t.is(zooParsed.animals[0].name, 'Arthur');
  t.assert(zooParsed.animals[1] instanceof Cat);
  t.is(zooParsed.animals[1].name, 'Merlin');
});

test('@JsonTypeInfo at property level with JsonTypeInfoAs.PROPERTY without subtypes name and using a custom @JsonTypeIdResolver', t => {
  class CustomTypeIdResolver implements TypeIdResolver {
    idFromValue(obj: any, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): string {
      if (obj instanceof Dog) {
        return 'animalDogType';
      } else if (obj instanceof Cat) {
        return 'animalCatType';
      }
      return null;
    }
    typeFromId(id: string, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): ClassType<any> {
      switch (id) {
      case 'animalDogType':
        return Dog;
      case 'animalCatType':
        return Cat;
      }
      return null;
    };
  }

  class Zoo {
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.PROPERTY
    })
    @JsonTypeIdResolver({resolver: new CustomTypeIdResolver()})
    @JsonProperty()
    @JsonClassType({type: () => [Array, [Animal]]})
    animals: Animal[] = [];
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"animals":[{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"},"@type":"animalDogType"},{"name":"Merlin","@type":"animalCatType"}]}'));

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

test('@JsonTypeInfo at method level with JsonTypeInfoAs.PROPERTY without subtypes name and using a custom @JsonTypeIdResolver', t => {
  class CustomTypeIdResolver implements TypeIdResolver {
    idFromValue(obj: any, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): string {
      if (obj instanceof Dog) {
        return 'animalDogType';
      } else if (obj instanceof Cat) {
        return 'animalCatType';
      }
      return null;
    }
    typeFromId(id: string, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): ClassType<any> {
      switch (id) {
      case 'animalDogType':
        return Dog;
      case 'animalCatType':
        return Cat;
      }
      return null;
    };
  }

  class Zoo {
    @JsonProperty()
    @JsonClassType({type: () => [Array, [Animal]]})
    animals: Animal[] = [];

    @JsonGetter()
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.PROPERTY
    })
    @JsonTypeIdResolver({resolver: new CustomTypeIdResolver()})
    @JsonClassType({type: () => [Array, [Animal]]})
    getAnimals(): Animal[] {
      return this.animals;
    }

    @JsonSetter()
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.PROPERTY
    })
    @JsonTypeIdResolver({resolver: new CustomTypeIdResolver()})
    setAnimals(@JsonClassType({type: () => [Array, [Animal]]}) animals) {
      this.animals = animals;
    }
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
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
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"animals":[{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"},"@type":"animalDogType"},{"name":"Merlin","@type":"animalCatType"}]}'));

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

test('@JsonTypeInfo and @JsonSubTypes at parameter level with JsonTypeInfoAs.PROPERTY without subtypes name', t => {
  class Zoo {
    @JsonProperty()
    @JsonClassType({type: () => [Array, [Animal]]})
    animals: Animal[] = [];

    constructor(
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
    @JsonClassType({type: () => [Array, [Animal]]})
      animals: Animal[]) {
      this.animals = animals;
    }
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    mother: Dog;
  }

  class Cat extends Animal {

  }

  const objectMapper = new ObjectMapper();
  // eslint-disable-next-line max-len
  const jsonData = '{"animals":[{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"},"@type":"Dog"},{"name":"Merlin","@type":"Cat"}]}';

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

test('@JsonTypeInfo at parameter level with JsonTypeInfoAs.PROPERTY without subtypes name and using a custom @JsonTypeIdResolver', t => {
  class CustomTypeIdResolver implements TypeIdResolver {
    idFromValue(obj: any, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): string {
      if (obj instanceof Dog) {
        return 'animalDogType';
      } else if (obj instanceof Cat) {
        return 'animalCatType';
      }
      return null;
    }
    typeFromId(id: string, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): ClassType<any> {
      switch (id) {
      case 'animalDogType':
        return Dog;
      case 'animalCatType':
        return Cat;
      }
      return null;
    };
  }

  class Zoo {
    @JsonProperty()
    @JsonClassType({type: () => [Array, [Animal]]})
    animals: Animal[] = [];

    constructor(
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.PROPERTY
    })
    @JsonTypeIdResolver({resolver: new CustomTypeIdResolver()})
    @JsonClassType({type: () => [Array, [Animal]]})
      animals: Animal[]) {
      this.animals = animals;
    }
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    mother: Dog;
  }

  class Cat extends Animal {

  }

  const objectMapper = new ObjectMapper();
  // eslint-disable-next-line max-len
  const jsonData = '{"animals":[{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"},"@type":"animalDogType"},{"name":"Merlin","@type":"animalCatType"}]}';

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

test('@JsonTypeInfo at parameter level (inside @JsonClass) with JsonTypeInfoAs.PROPERTY without subtypes name', t => {
  class Zoo {
    @JsonProperty()
    @JsonClassType({type: () => [Array, [Animal]]})
    animals: Animal[] = [];

    constructor(
    @JsonClassType({type: () => [Array, [
      () => ({
        target: Animal,
        decorators: [
          {
            name: 'JsonTypeInfo',
            options: {
              use: JsonTypeInfoId.NAME,
              include: JsonTypeInfoAs.PROPERTY,
              property: '@type'
            }
          },
          {
            name: 'JsonSubTypes',
            options: {
              types: [
                {class: () => Dog},
                {class: () => Cat},
              ]
            }
          }
        ]
      })
    ]]})
      animals: Animal[]) {
      this.animals = animals;
    }
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    mother: Dog;
  }

  class Cat extends Animal {

  }

  const objectMapper = new ObjectMapper();
  // eslint-disable-next-line max-len
  const jsonData = '{"animals":[{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"},"@type":"Dog"},{"name":"Merlin","@type":"Cat"}]}';

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

// eslint-disable-next-line max-len
test('@JsonTypeInfo at parameter level (inside @JsonClass) with JsonTypeInfoAs.PROPERTY without subtypes name and using a custom @JsonTypeIdResolver', t => {
  class CustomTypeIdResolver implements TypeIdResolver {
    idFromValue(obj: any, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): string {
      if (obj instanceof Dog) {
        return 'animalDogType';
      } else if (obj instanceof Cat) {
        return 'animalCatType';
      }
      return null;
    }
    typeFromId(id: string, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): ClassType<any> {
      switch (id) {
      case 'animalDogType':
        return Dog;
      case 'animalCatType':
        return Cat;
      }
      return null;
    };
  }

  class Zoo {
    @JsonProperty()
    @JsonClassType({type: () => [Array, [Animal]]})
    animals: Animal[] = [];

    constructor(
    @JsonClassType({type: () => [Array, [
      () => ({
        target: Animal,
        decorators: [
          {
            name: 'JsonTypeInfo',
            options: {
              use: JsonTypeInfoId.NAME,
              include: JsonTypeInfoAs.PROPERTY,
              property: '@type'
            }
          },
          {
            name: 'JsonTypeIdResolver',
            options: {
              resolver: new CustomTypeIdResolver()
            }
          }
        ]
      })
    ]]})
      animals: Animal[]) {
      this.animals = animals;
    }
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    mother: Dog;
  }

  class Cat extends Animal {

  }

  const objectMapper = new ObjectMapper();
  // eslint-disable-next-line max-len
  const jsonData = '{"animals":[{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"},"@type":"animalDogType"},{"name":"Merlin","@type":"animalCatType"}]}';

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
    @JsonProperty() @JsonClassType({type: () => [String]})
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
  const jsonData = objectMapper.stringify<Array<Animal>>([dog, cat]);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('[{"name":"Arthur","@type":"dog"},{"name":"Merlin","@type":"cat"}]'));

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
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  @JsonTypeName({value: 'dog'})
  class Dog extends Animal {
    @JsonTypeId() @JsonClassType({type: () => [String]})
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
  const jsonData = objectMapper.stringify<Array<Animal>>([dog, cat]);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('[{"DogTypeId":{"name":"Arthur"}},{"CatTypeId":{"name":"Merlin"}}]'));

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
    @JsonProperty() @JsonClassType({type: () => [String]})
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
  const jsonData = objectMapper.stringify<Array<Animal>>([dog, cat]);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('[{"name":"Arthur","myType":"dog"},{"name":"Merlin","myType":"cat"}]'));

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
    @JsonProperty() @JsonClassType({type: () => [String]})
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
  const jsonData = objectMapper.stringify<Array<Animal>>([dog, cat]);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('[{"dog":{"name":"Arthur"}},{"cat":{"name":"Merlin"}}]'));

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
    @JsonProperty() @JsonClassType({type: () => [String]})
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
  const jsonData = objectMapper.stringify<Array<Animal>>([dog, cat]);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('[["dog",{"name":"Arthur"}],["cat",{"name":"Merlin"}]]'));

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});

test('@JsonTypeInfo and @JsonSubTypes at class level with JsonTypeInfoAs.EXTERNAL_PROPERTY without subtypes name', t => {
  @JsonTypeInfo({
    use: JsonTypeInfoId.NAME,
    include: JsonTypeInfoAs.EXTERNAL_PROPERTY
  })
  @JsonSubTypes({
    types: [
      {class: () => Dog},
      {class: () => Cat},
    ]
  })
  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
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
  const jsonData = objectMapper.stringify<Array<Animal>>([dog, cat]);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('[{"name":"Arthur","@type":"Dog"},{"name":"Merlin","@type":"Cat"}]'));

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});

test('@JsonTypeInfo at class level with JsonTypeInfoAs.EXTERNAL_PROPERTY without subtypes name and using a custom @JsonTypeIdResolver', t => {
  class CustomTypeIdResolver implements TypeIdResolver {
    idFromValue(obj: any, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): string {
      if (obj instanceof Dog) {
        return 'animalDogType';
      } else if (obj instanceof Cat) {
        return 'animalCatType';
      }
      return null;
    }
    typeFromId(id: string, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): ClassType<any> {
      switch (id) {
      case 'animalDogType':
        return Dog;
      case 'animalCatType':
        return Cat;
      }
      return null;
    };
  }

  @JsonTypeInfo({
    use: JsonTypeInfoId.NAME,
    include: JsonTypeInfoAs.EXTERNAL_PROPERTY
  })
  @JsonTypeIdResolver({resolver: new CustomTypeIdResolver()})
  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
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
  const jsonData = objectMapper.stringify<Array<Animal>>([dog, cat]);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('[{"name":"Arthur","@type":"animalDogType"},{"name":"Merlin","@type":"animalCatType"}]'));

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});

test('@JsonTypeInfo and @JsonSubTypes at property level with JsonTypeInfoAs.EXTERNAL_PROPERTY without subtypes name', t => {
  class Zoo {
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.EXTERNAL_PROPERTY,
      property: 'animalType',
    })
    @JsonSubTypes({
      types: [
        {class: () => Dog},
        {class: () => Cat},
      ]
    })
    @JsonProperty()
    @JsonClassType({type: () => [Animal]})
    animal: Animal;
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
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
  zoo.animal = dog;

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Zoo>(zoo);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"animal":{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"}},"animalType":"Dog"}'));

  const zooParsed = objectMapper.parse<Zoo>(jsonData, {mainCreator: () => [Zoo]});
  t.assert(zooParsed instanceof Zoo);
  t.assert(zooParsed.animal instanceof Dog);
  t.is(zooParsed.animal.name, 'Arthur');
  t.assert((zooParsed.animal as Dog).father instanceof Dog);
  t.is((zooParsed.animal as Dog).father.name, 'Buddy');
  t.assert((zooParsed.animal as Dog).mother instanceof Dog);
  t.is((zooParsed.animal as Dog).mother.name, 'Coco');
});

test('@JsonTypeInfo and @JsonSubTypes at method level with JsonTypeInfoAs.EXTERNAL_PROPERTY without subtypes name', t => {
  class Zoo {
    @JsonProperty()
    @JsonClassType({type: () => [Animal]})
    animal: Animal;

    @JsonGetter()
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.EXTERNAL_PROPERTY,
      property: 'animalType',
    })
    @JsonSubTypes({
      types: [
        {class: () => Dog},
        {class: () => Cat},
      ]
    })
    @JsonClassType({type: () => [Animal]})
    getAnimal(): Animal {
      return this.animal;
    }

    @JsonSetter()
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.EXTERNAL_PROPERTY,
      property: 'animalType',
    })
    @JsonSubTypes({
      types: [
        {class: () => Dog},
        {class: () => Cat},
      ]
    })
    setAnimal(@JsonClassType({type: () => [Animal]}) animal) {
      this.animal = animal;
    }
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {

  }

  class Cat extends Animal {

  }

  const zoo = new Zoo();
  const dog = new Dog('Arthur');
  zoo.animal = dog;

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Zoo>(zoo);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"animal":{"name":"Arthur"},"animalType":"Dog"}'));

  const zooParsed = objectMapper.parse<Zoo>(jsonData, {mainCreator: () => [Zoo]});
  t.assert(zooParsed instanceof Zoo);
  t.assert(zooParsed.animal instanceof Dog);
  t.is(zooParsed.animal.name, 'Arthur');
});

test('@JsonTypeInfo at property level with JsonTypeInfoAs.EXTERNAL_PROPERTY without subtypes name and using a custom @JsonTypeIdResolver', t => {
  class CustomTypeIdResolver implements TypeIdResolver {
    idFromValue(obj: any, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): string {
      if (obj instanceof Dog) {
        return 'animalDogType';
      }
      return null;
    }
    typeFromId(id: string, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): ClassType<any> {
      switch (id) {
      case 'animalDogType':
        return Dog;
      }
      return null;
    };
  }

  class Zoo {
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.EXTERNAL_PROPERTY,
      property: 'animalType',
    })
    @JsonTypeIdResolver({resolver: new CustomTypeIdResolver()})
    @JsonProperty()
    @JsonClassType({type: () => [Animal]})
    animal: Animal;
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    mother: Dog;
  }

  const zoo = new Zoo();
  const dog = new Dog('Arthur');
  const fatherDog = new Dog('Buddy');
  const motherDog = new Dog('Coco');
  dog.father = fatherDog;
  dog.mother = motherDog;
  zoo.animal = dog;

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Zoo>(zoo);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"animal":{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"}},"animalType":"animalDogType"}'));

  const zooParsed = objectMapper.parse<Zoo>(jsonData, {mainCreator: () => [Zoo]});
  t.assert(zooParsed instanceof Zoo);
  t.assert(zooParsed.animal instanceof Dog);
  t.is(zooParsed.animal.name, 'Arthur');
  t.assert((zooParsed.animal as Dog).father instanceof Dog);
  t.is((zooParsed.animal as Dog).father.name, 'Buddy');
  t.assert((zooParsed.animal as Dog).mother instanceof Dog);
  t.is((zooParsed.animal as Dog).mother.name, 'Coco');
});

test('@JsonTypeInfo at method level with JsonTypeInfoAs.EXTERNAL_PROPERTY without subtypes name and using a custom @JsonTypeIdResolver', t => {
  class CustomTypeIdResolver implements TypeIdResolver {
    idFromValue(obj: any, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): string {
      if (obj instanceof Dog) {
        return 'animalDogType';
      }
      return null;
    }
    typeFromId(id: string, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): ClassType<any> {
      switch (id) {
      case 'animalDogType':
        return Dog;
      }
      return null;
    };
  }

  class Zoo {
    @JsonProperty()
    @JsonClassType({type: () => [Animal]})
    animal: Animal;

    @JsonGetter()
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.EXTERNAL_PROPERTY,
      property: 'animalType',
    })
    @JsonTypeIdResolver({resolver: new CustomTypeIdResolver()})
    @JsonClassType({type: () => [Animal]})
    getAnimal(): Animal {
      return this.animal;
    }

    @JsonSetter()
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.EXTERNAL_PROPERTY,
      property: 'animalType',
    })
    @JsonTypeIdResolver({resolver: new CustomTypeIdResolver()})
    setAnimal(@JsonClassType({type: () => [Animal]}) animal) {
      this.animal = animal;
    }
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    mother: Dog;
  }

  const zoo = new Zoo();
  const dog = new Dog('Arthur');
  const fatherDog = new Dog('Buddy');
  const motherDog = new Dog('Coco');
  dog.father = fatherDog;
  dog.mother = motherDog;
  zoo.animal = dog;

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Zoo>(zoo);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"animal":{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"}},"animalType":"animalDogType"}'));

  const zooParsed = objectMapper.parse<Zoo>(jsonData, {mainCreator: () => [Zoo]});
  t.assert(zooParsed instanceof Zoo);
  t.assert(zooParsed.animal instanceof Dog);
  t.is(zooParsed.animal.name, 'Arthur');
  t.assert((zooParsed.animal as Dog).father instanceof Dog);
  t.is((zooParsed.animal as Dog).father.name, 'Buddy');
  t.assert((zooParsed.animal as Dog).mother instanceof Dog);
  t.is((zooParsed.animal as Dog).mother.name, 'Coco');
});

test('@JsonTypeInfo and @JsonSubTypes at parameter level with JsonTypeInfoAs.EXTERNAL_PROPERTY without subtypes name', t => {
  class Zoo {
    @JsonProperty()
    @JsonClassType({type: () => [Animal]})
    animal: Animal;

    constructor(
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.EXTERNAL_PROPERTY,
      property: 'animalType',
    })
    @JsonSubTypes({
      types: [
        {class: () => Dog},
        {class: () => Cat},
      ]
    })
    @JsonClassType({type: () => [Animal]})
      animal: Animal) {
      this.animal = animal;
    }
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    mother: Dog;
  }

  class Cat extends Animal {

  }

  const objectMapper = new ObjectMapper();
  // eslint-disable-next-line max-len
  const jsonData = '{"animal":{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"}},"animalType":"Dog"}';

  const zooParsed = objectMapper.parse<Zoo>(jsonData, {mainCreator: () => [Zoo]});
  t.assert(zooParsed instanceof Zoo);
  t.assert(zooParsed.animal instanceof Dog);
  t.is(zooParsed.animal.name, 'Arthur');
  t.assert((zooParsed.animal as Dog).father instanceof Dog);
  t.is((zooParsed.animal as Dog).father.name, 'Buddy');
  t.assert((zooParsed.animal as Dog).mother instanceof Dog);
  t.is((zooParsed.animal as Dog).mother.name, 'Coco');
});

test('@JsonTypeInfo at parameter level with JsonTypeInfoAs.EXTERNAL_PROPERTY without subtypes name and using a custom @JsonTypeIdResolver', t => {
  class CustomTypeIdResolver implements TypeIdResolver {
    idFromValue(obj: any, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): string {
      if (obj instanceof Dog) {
        return 'animalDogType';
      } else if (obj instanceof Cat) {
        return 'animalCatType';
      }
      return null;
    }
    typeFromId(id: string, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): ClassType<any> {
      switch (id) {
      case 'animalDogType':
        return Dog;
      case 'animalCatType':
        return Cat;
      }
      return null;
    };
  }

  class Zoo {
    @JsonProperty()
    @JsonClassType({type: () => [Animal]})
    animal: Animal;

    constructor(
    @JsonTypeInfo({
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.EXTERNAL_PROPERTY,
      property: 'animalType',
    })
    @JsonTypeIdResolver({resolver: new CustomTypeIdResolver()})
    @JsonClassType({type: () => [Animal]})
      animal: Animal) {
      this.animal = animal;
    }
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    mother: Dog;
  }

  class Cat extends Animal {

  }

  const objectMapper = new ObjectMapper();
  // eslint-disable-next-line max-len
  const jsonData = '{"animal":{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"}},"animalType":"animalDogType"}';

  const zooParsed = objectMapper.parse<Zoo>(jsonData, {mainCreator: () => [Zoo]});
  t.assert(zooParsed instanceof Zoo);
  t.assert(zooParsed.animal instanceof Dog);
  t.is(zooParsed.animal.name, 'Arthur');
  t.assert((zooParsed.animal as Dog).father instanceof Dog);
  t.is((zooParsed.animal as Dog).father.name, 'Buddy');
  t.assert((zooParsed.animal as Dog).mother instanceof Dog);
  t.is((zooParsed.animal as Dog).mother.name, 'Coco');
});

test('@JsonTypeInfo at parameter level (inside @JsonClass) with JsonTypeInfoAs.EXTERNAL_PROPERTY without subtypes name', t => {
  class Zoo {
    @JsonProperty()
    @JsonClassType({type: () => [Animal]})
    animal: Animal;

    constructor(
    @JsonClassType({type: () => [
      () => ({
        target: Animal,
        decorators: [
          {
            name: 'JsonTypeInfo',
            options: {
              use: JsonTypeInfoId.NAME,
              include: JsonTypeInfoAs.EXTERNAL_PROPERTY,
              property: 'animalType'
            }
          },
          {
            name: 'JsonSubTypes',
            options: {
              types: [
                {class: () => Dog},
                {class: () => Cat},
              ]
            }
          }
        ]
      })
    ]})
      animal: Animal) {
      this.animal = animal;
    }
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    mother: Dog;
  }

  class Cat extends Animal {

  }

  const objectMapper = new ObjectMapper();
  // eslint-disable-next-line max-len
  const jsonData = '{"animal":{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"}},"animalType":"Dog"}';

  const zooParsed = objectMapper.parse<Zoo>(jsonData, {mainCreator: () => [Zoo]});
  t.assert(zooParsed instanceof Zoo);
  t.assert(zooParsed.animal instanceof Dog);
  t.is(zooParsed.animal.name, 'Arthur');
  t.assert((zooParsed.animal as Dog).father instanceof Dog);
  t.is((zooParsed.animal as Dog).father.name, 'Buddy');
  t.assert((zooParsed.animal as Dog).mother instanceof Dog);
  t.is((zooParsed.animal as Dog).mother.name, 'Coco');
});

// eslint-disable-next-line max-len
test('@JsonTypeInfo at parameter level (inside @JsonClass) with JsonTypeInfoAs.EXTERNAL_PROPERTY without subtypes name and using a custom @JsonTypeIdResolver', t => {
  class CustomTypeIdResolver implements TypeIdResolver {
    idFromValue(obj: any, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): string {
      if (obj instanceof Dog) {
        return 'animalDogType';
      } else if (obj instanceof Cat) {
        return 'animalCatType';
      }
      return null;
    }
    typeFromId(id: string, options: (JsonStringifierTransformerContext | JsonParserTransformerContext)): ClassType<any> {
      switch (id) {
      case 'animalDogType':
        return Dog;
      case 'animalCatType':
        return Cat;
      }
      return null;
    };
  }

  class Zoo {
    @JsonProperty()
    @JsonClassType({type: () => [Animal]})
    animal: Animal;

    constructor(
    @JsonClassType({type: () => [
      () => ({
        target: Animal,
        decorators: [
          {
            name: 'JsonTypeInfo',
            options: {
              use: JsonTypeInfoId.NAME,
              include: JsonTypeInfoAs.EXTERNAL_PROPERTY,
              property: 'animalType'
            }
          },
          {
            name: 'JsonTypeIdResolver',
            options: {
              resolver: new CustomTypeIdResolver()
            }
          }
        ]
      })
    ]})
      animal: Animal) {
      this.animal = animal;
    }
  }

  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    father: Dog;
    @JsonProperty()
    @JsonClassType({type: () => [Dog]})
    mother: Dog;
  }

  class Cat extends Animal {

  }

  const objectMapper = new ObjectMapper();
  // eslint-disable-next-line max-len
  const jsonData = '{"animal":{"name":"Arthur","father":{"name":"Buddy"},"mother":{"name":"Coco"}},"animalType":"animalDogType"}';

  const zooParsed = objectMapper.parse<Zoo>(jsonData, {mainCreator: () => [Zoo]});
  t.assert(zooParsed instanceof Zoo);
  t.assert(zooParsed.animal instanceof Dog);
  t.is(zooParsed.animal.name, 'Arthur');
  t.assert((zooParsed.animal as Dog).father instanceof Dog);
  t.is((zooParsed.animal as Dog).father.name, 'Buddy');
  t.assert((zooParsed.animal as Dog).mother instanceof Dog);
  t.is((zooParsed.animal as Dog).mother.name, 'Coco');
});

test('@JsonTypeInfo with JsonTypeInfoAs.EXTERNAL_PROPERTY with subtypes name', t => {
  @JsonTypeInfo({
    use: JsonTypeInfoId.NAME,
    include: JsonTypeInfoAs.EXTERNAL_PROPERTY,
    property: 'animalType',
  })
  @JsonSubTypes({
    types: [
      {class: () => Dog, name: 'dog'},
      {class: () => Cat, name: 'cat'},
    ]
  })
  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
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
  const jsonData = objectMapper.stringify<Array<Animal>>([dog, cat]);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('[{"name":"Arthur","animalType":"dog"},{"name":"Merlin","animalType":"cat"}]'));

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});

// Appears that test @ lin 794 is minamed and is actually a wrapper object test
//
// test('@JsonTypeInfo with JsonTypeInfoAs.EXTERNAL_PROPERTY with @JsonTypeId', t => {
//   @JsonTypeInfo({
//     use: JsonTypeInfoId.NAME,
//     include: JsonTypeInfoAs.WRAPPER_OBJECT,
//     property: 'animalType',
//   })
//   @JsonSubTypes({
//     types: [
//       {class: () => Dog, name: 'dog'},
//       {class: () => Cat, name: 'cat'},
//     ]
//   })
//   class Animal {
//     @JsonProperty() @JsonClassType({type: () => [String]})
//     name: string;

//     constructor(name: string) {
//       this.name = name;
//     }
//   }

//   @JsonTypeName({value: 'dog'})
//   class Dog extends Animal {
//     @JsonTypeId() @JsonClassType({type: () => [String]})
//     typeId: string;
//   }

//   @JsonTypeName({value: 'cat'})
//   class Cat extends Animal {
//     @JsonTypeId()
//     getTypeId(): string {
//       return 'CatTypeId';
//     }
//   }

//   const dog = new Dog('Arthur');
//   dog.typeId = 'DogTypeId';

//   const cat = new Cat('Merlin');

//   const objectMapper = new ObjectMapper();
//   const jsonData = objectMapper.stringify<Array<Animal>>([dog, cat]);
//   t.deepEqual(JSON.parse(jsonData), JSON.parse('[{"DogTypeId":{"name":"Arthur"}},{"CatTypeId":{"name":"Merlin"}}]'));

//   const err1 = t.throws<JacksonError>(() => {
//     objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
//   });

//   t.assert(err1 instanceof JacksonError);

//   const err2 = t.throws<JacksonError>(() => {
//     // eslint-disable-next-line max-len
//     objectMapper.parse<Array<Animal>>('[{"dog":{"name":"Arthur"}},{"CatTypeId":{"name":"Merlin"}}]', {mainCreator: () => [Array, [Animal]]});
//   });

//   t.assert(err2 instanceof JacksonError);

//   const err3 = t.throws<JacksonError>(() => {
//     // eslint-disable-next-line max-len
//     objectMapper.parse<Array<Animal>>('[{"DogTypeId":{"name":"Arthur"}},{"cat":{"name":"Merlin"}}]', {mainCreator: () => [Array, [Animal]]});
//   });

//   t.assert(err3 instanceof JacksonError);

//   // eslint-disable-next-line max-len
//   const animals = objectMapper.parse<Array<Animal>>('[{"dog":{"name":"Arthur"}},{"cat":{"name":"Merlin"}}]', {mainCreator: () => [Array, [Animal]]});
//   t.assert(animals instanceof Array);
//   t.is(animals.length, 2);
//   t.assert(animals[0] instanceof Dog);
//   t.is(animals[0].name, 'Arthur');
//   t.assert(animals[1] instanceof Cat);
//   t.is(animals[1].name, 'Merlin');
// });

test('@JsonTypeInfo with JsonTypeInfoAs.EXTERNAL_PROPERTY and custom property value', t => {
  @JsonTypeInfo({
    use: JsonTypeInfoId.NAME,
    include: JsonTypeInfoAs.EXTERNAL_PROPERTY,
    property: 'myType'
  })
  @JsonSubTypes({
    types: [
      {class: () => Dog, name: 'dog'},
      {class: () => Cat, name: 'cat'},
    ]
  })
  class Animal {
    @JsonProperty() @JsonClassType({type: () => [String]})
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
  const jsonData = objectMapper.stringify<Array<Animal>>([dog, cat]);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('[{"name":"Arthur","myType":"dog"},{"name":"Merlin","myType":"cat"}]'));

  const animals = objectMapper.parse<Array<Animal>>(jsonData, {mainCreator: () => [Array, [Animal]]});
  t.assert(animals instanceof Array);
  t.is(animals.length, 2);
  t.assert(animals[0] instanceof Dog);
  t.is(animals[0].name, 'Arthur');
  t.assert(animals[1] instanceof Cat);
  t.is(animals[1].name, 'Merlin');
});

