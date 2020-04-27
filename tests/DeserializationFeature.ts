import test from 'ava';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonClassType} from '../src/decorators/JsonClassType';
import {JsonTypeInfo, JsonTypeInfoAs, JsonTypeInfoId} from '../src/decorators/JsonTypeInfo';
import {JsonSubTypes} from '../src/decorators/JsonSubTypes';
import {JacksonError} from '../src/core/JacksonError';
import {JsonCreator} from '../src/decorators/JsonCreator';
import {JsonIdentityInfo, ObjectIdGenerator} from '../src/decorators/JsonIdentityInfo';

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
  objectMapper.defaultParserContext.features.deserialization.ACCEPT_CASE_INSENSITIVE_PROPERTIES = true;

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
    @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty()
    @JsonClassType({type: () => [String]})
    email: string;
    @JsonProperty()
    @JsonClassType({type: () => [BigInt]})
    age: BigInt;
    @JsonProperty()
    @JsonClassType({type: () => [Boolean]})
    active: boolean;
    @JsonProperty()
    @JsonClassType({type: () => [Boolean]})
    deleted: boolean;
  }

  const objectMapper = new ObjectMapper();
  objectMapper.defaultParserContext.features.deserialization.ALLOW_COERCION_OF_SCALARS = true;

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
  objectMapper.defaultParserContext.features.deserialization.FAIL_ON_INVALID_SUBTYPE = false;

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

  objectMapper.defaultParserContext.features.deserialization.FAIL_ON_INVALID_SUBTYPE = true;
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
  objectMapper.defaultParserContext.features.deserialization.FAIL_ON_MISSING_TYPE_ID = false;

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

  objectMapper.defaultParserContext.features.deserialization.FAIL_ON_MISSING_TYPE_ID = true;
  const errFailOnMissinTypeId = t.throws<JacksonError>(() => {
    objectMapper.parse<Array<Animal>>(
      '[{"name":"Arthur"},{"name":"Merlin"}]',
      {mainCreator: () => [Array, [Animal]]});
  });
  t.assert(errFailOnMissinTypeId instanceof JacksonError);
});

test('DeserializationFeature.ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT set to true', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;
    @JsonProperty()
    @JsonClassType({type: () => [Array, [String]]})
    otherInfo: Array<string>;
  }

  const objectMapper = new ObjectMapper();
  objectMapper.defaultParserContext.features.deserialization.ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT = true;

  const userParsed = objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfo":[]}', {
    mainCreator: () => [User]
  });
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.otherInfo, null);
});

test('DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT set to true', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;
    @JsonProperty()
    @JsonClassType({type: () => [Map, [String, String]]})
    otherInfoMap: Map<string, string> = new Map();
    @JsonProperty()
    @JsonClassType({type: () => [Object, [String, String]]})
    otherInfoObjLiteral: {phone?: string; address?: string} = {};
  }

  const objectMapper = new ObjectMapper();
  objectMapper.defaultParserContext.features.deserialization.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT = true;

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"","otherInfoMap":{"phone":""},"otherInfoObjLiteral":{"address":""}}', {
    mainCreator: () => [User]
  });
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, null);
  t.assert(userParsed.otherInfoMap instanceof Map);
  t.is(userParsed.otherInfoMap.get('phone'), null);
  t.is(userParsed.otherInfoObjLiteral.address, null);
});

test('DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES set to false', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;
  }

  const objectMapper = new ObjectMapper();
  objectMapper.defaultParserContext.features.deserialization.FAIL_ON_UNKNOWN_PROPERTIES = false;

  const userParsed = objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","unknownProperty": true}', {
    mainCreator: () => [User]
  });
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(!Object.hasOwnProperty.call(userParsed, 'unknownProperty'));
});

test('DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES set to true', t => {
  class User {
    @JsonProperty()
    @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty()
    @JsonClassType({type: () => [String]})
    firstname: string;
    @JsonProperty()
    @JsonClassType({type: () => [String]})
    lastname: string;
  }

  const objectMapper = new ObjectMapper();
  objectMapper.defaultParserContext.features.deserialization.FAIL_ON_NULL_FOR_PRIMITIVES = true;

  const errFailOnNullForPrimitives = t.throws<JacksonError>(() => {
    objectMapper.parse<User>('{"id":null,"firstname":"John","lastname":"Alfa"}', {
      mainCreator: () => [User]
    });
  });
  t.assert(errFailOnNullForPrimitives instanceof JacksonError);
});

test('DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES set to true', t => {
  @JsonCreator()
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;

    constructor(id: number, firstname: string, lastname: string) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  const objectMapper = new ObjectMapper();
  objectMapper.defaultParserContext.features.deserialization.FAIL_ON_MISSING_CREATOR_PROPERTIES = true;

  const errFailOnNullForPrimitives = t.throws<JacksonError>(() => {
    objectMapper.parse<User>('{"firstname":"John","lastname":"Alfa"}', {
      mainCreator: () => [User]
    });
  });
  t.assert(errFailOnNullForPrimitives instanceof JacksonError);
});

test('DeserializationFeature.FAIL_ON_NULL_CREATOR_PROPERTIES set to true', t => {
  @JsonCreator()
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;

    constructor(id: number, firstname: string, lastname: string) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  const objectMapper = new ObjectMapper();
  objectMapper.defaultParserContext.features.deserialization.FAIL_ON_NULL_CREATOR_PROPERTIES = true;

  const errFailOnNullForPrimitives = t.throws<JacksonError>(() => {
    objectMapper.parse<User>('{"id":null,"firstname":"John","lastname":"Alfa"}', {
      mainCreator: () => [User]
    });
  });
  t.assert(errFailOnNullForPrimitives instanceof JacksonError);
});

test('DeserializationFeature.FAIL_ON_UNRESOLVED_OBJECT_IDS set to false', t => {
  @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'User'})
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;

    @JsonProperty()
    @JsonClassType({type: () => [Array, [Item]]})
    items: Item[] = [];

    constructor(id: number, email: string, firstname: string, lastname: string) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'Item'})
  class Item {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonClassType({type: () => [User]})
    owner: User;

    constructor(id: number, name: string, @JsonClassType({type: () => [User]}) owner: User) {
      this.id = id;
      this.name = name;
      this.owner = owner;
    }
  }

  const objectMapper = new ObjectMapper();
  objectMapper.defaultParserContext.features.deserialization.FAIL_ON_UNRESOLVED_OBJECT_IDS = false;

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"items":[{"id":1,"name":"Book","owner":2}],"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}', {
    mainCreator: () => [User]
  });
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.is(userParsed.items.length, 1);
  t.assert(userParsed.items[0] instanceof Item);
  t.is(userParsed.items[0].id, 1);
  t.is(userParsed.items[0].name, 'Book');
  // @ts-ignore
  t.is(userParsed.items[0].owner, null);
});
