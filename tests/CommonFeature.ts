import test from 'ava';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonView} from '../src/decorators/JsonView';
import {JsonClassType} from '../src/decorators/JsonClassType';

test('CommonFeature.DEFAULT_VIEW_INCLUSION set to false', t => {
  class Views {
    static public = class Public {};
    static internal = class Internal {};
  }

  class User {
    @JsonProperty()
    @JsonView({value: () => [Views.public]})
    id: number;
    @JsonProperty()
    email: string;
    @JsonProperty()
    @JsonView({value: () => [Views.internal]})
    password: string;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;
    @JsonProperty()
    @JsonView({value: () => [Views.internal]})
    activationCode: string;

    // eslint-disable-next-line no-shadow,max-len
    constructor(@JsonView({value: () => [Views.public]}) id: number, email: string, password: string, firstname: string, lastname: string, activationCode: string) {
      this.id = id;
      this.email = email;
      this.password = password;
      this.firstname = firstname;
      this.lastname = lastname;
      this.activationCode = activationCode;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'rtJ9FrqP!rCE', 'John', 'Alfa', '75afe654-695e-11ea-bc55-0242ac130003');

  const objectMapper = new ObjectMapper();
  objectMapper.features.serialization.DEFAULT_VIEW_INCLUSION = false;
  objectMapper.features.deserialization.DEFAULT_VIEW_INCLUSION = false;

  const jsonData = objectMapper.stringify<User>(user, {withViews: () => [Views.public]});
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1}'));

  // eslint-disable-next-line max-len
  const userParsed = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}', {
    mainCreator: () => [User],
    withViews: () => [Views.public]
  });
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, null);
  t.is(userParsed.password, null);
  t.is(userParsed.firstname, null);
  t.is(userParsed.lastname, null);
  t.is(userParsed.activationCode, null);
});

test('CommonFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL set to true', t => {
  class User {
    @JsonProperty()
    @JsonClassType({type: () => [BigInt]})
    id: BigInt;
    @JsonProperty()
    @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty()
    @JsonClassType({type: () => [Number]})
    age: number;
    @JsonProperty()
    @JsonClassType({type: () => [Boolean]})
    deleted: boolean;

    constructor(id: BigInt, name: string, age: number, deleted: boolean) {
      this.id = id;
      this.name = name;
      this.age = age;
      this.deleted = deleted;
    }
  }

  const user = new User(null, null, null, null);

  const objectMapper = new ObjectMapper();
  objectMapper.features.serialization.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL = true;
  objectMapper.features.deserialization.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL = true;

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":"0n","name":"","age":0,"deleted":false}'));

  const userParsed = objectMapper.parse<User>('{"id":null,"name":null,"age":null,"deleted":null}', {
    mainCreator: () => [User]
  });
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, BigInt(0));
  t.is(userParsed.name, '');
  t.is(userParsed.age, 0);
  t.is(userParsed.deleted, false);
});
