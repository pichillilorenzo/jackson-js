import test from 'ava';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonClass} from '../src/decorators/JsonClass';
import {JsonTypeInfo, JsonTypeInfoAs, JsonTypeInfoId} from '../src/decorators/JsonTypeInfo';
import {JsonSubTypes} from '../src/decorators/JsonSubTypes';
import {JacksonError} from '../src/core/JacksonError';

test('DeserializationFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES set to true', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;

    constructor(UserID: number) {
      this.id = UserID;
    }
  }

  const objectMapper = new ObjectMapper();
  objectMapper.features.deserialization.ACCEPT_CASE_INSENSITIVE_PROPERTIES = true;

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"USERID":1,"eMaIl":"john.alfa@gmail.com","firstName":"John","lastName":"Alfa"}', {
    mainCreator: () => [User],
  });
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
});

test('DeserializationFeature.ALLOW_COERCION_OF_SCALARS set to true', t => {
  class User {
    @JsonProperty()
    @JsonClass({class: () => [Number]})
    id: number;
    @JsonProperty()
    @JsonClass({class: () => [String]})
    email: string;
    @JsonProperty()
    @JsonClass({class: () => [BigInt]})
    age: BigInt;
    @JsonProperty()
    @JsonClass({class: () => [Boolean]})
    active: boolean;
    @JsonProperty()
    @JsonClass({class: () => [Boolean]})
    deleted: boolean;
  }

  const objectMapper = new ObjectMapper();
  objectMapper.features.deserialization.ALLOW_COERCION_OF_SCALARS = true;

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"id":"1","email":"john.alfa@gmail.com","age":45,"active":"false","deleted":1}', {
    mainCreator: () => [User],
  });
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.age, BigInt(45));
  t.is(userParsed.active, false);
  t.is(userParsed.deleted, true);
});

test('DeserializationFeature.FAIL_ON_INVALID_SUBTYPE set to false', t => {
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
    @JsonProperty()
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {

  }

  class Cat extends Animal {

  }

  const objectMapper = new ObjectMapper();
  objectMapper.features.deserialization.FAIL_ON_INVALID_SUBTYPE = false;

  const animalsParsed = objectMapper.parse<Array<Animal>>(
    '[{"name":"Arthur","@type":"WrongTypeDog"},{"name":"Merlin","@type":"Cat"}]',
    {mainCreator: () => [Array, [Animal]]});
  t.assert(animalsParsed instanceof Array);
  t.is(animalsParsed.length, 2);
  t.assert(animalsParsed[0] instanceof Animal);
  t.assert(!(animalsParsed[0] instanceof Dog));
  t.is(animalsParsed[0].name, 'Arthur');
  t.assert(animalsParsed[1] instanceof Cat);
  t.is(animalsParsed[1].name, 'Merlin');

  objectMapper.features.deserialization.FAIL_ON_INVALID_SUBTYPE = true;
  const errFailOnInvalidSubtype = t.throws<JacksonError>(() => {
    objectMapper.parse<Array<Animal>>(
      '[{"name":"Arthur","@type":"WrongTypeDog"},{"name":"Merlin","@type":"Cat"}]',
      {mainCreator: () => [Array, [Animal]]});
  });
  t.assert(errFailOnInvalidSubtype instanceof JacksonError);
});

test('DeserializationFeature.FAIL_ON_MISSING_TYPE_ID set to false', t => {
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
    @JsonProperty()
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  class Dog extends Animal {

  }

  class Cat extends Animal {

  }

  const objectMapper = new ObjectMapper();
  objectMapper.features.deserialization.FAIL_ON_MISSING_TYPE_ID = false;

  const animalsParsed = objectMapper.parse<Array<Animal>>(
    '[{"name":"Arthur"},{"name":"Merlin"}]',
    {mainCreator: () => [Array, [Animal]]});
  t.assert(animalsParsed instanceof Array);
  t.is(animalsParsed.length, 2);
  t.assert(animalsParsed[0] instanceof Animal);
  t.assert(!(animalsParsed[0] instanceof Dog));
  t.is(animalsParsed[0].name, 'Arthur');
  t.assert(animalsParsed[1] instanceof Animal);
  t.assert(!(animalsParsed[1] instanceof Cat));
  t.is(animalsParsed[1].name, 'Merlin');

  objectMapper.features.deserialization.FAIL_ON_MISSING_TYPE_ID = true;
  const errFailOnMissinTypeId = t.throws<JacksonError>(() => {
    objectMapper.parse<Array<Animal>>(
      '[{"name":"Arthur"},{"name":"Merlin"}]',
      {mainCreator: () => [Array, [Animal]]});
  });
  t.assert(errFailOnMissinTypeId instanceof JacksonError);
});
