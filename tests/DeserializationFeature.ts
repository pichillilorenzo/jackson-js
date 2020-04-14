import test from 'ava';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonClass} from '../src/decorators/JsonClass';

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
