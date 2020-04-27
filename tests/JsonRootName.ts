import test from 'ava';
import {JsonRootName} from '../src/decorators/JsonRootName';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JacksonError} from '../src/core/JacksonError';

test('@JsonRootName without value', t => {
  @JsonRootName()
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;

    constructor(id: number, email: string) {
      this.id = id;
      this.email = email;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com');
  const objectMapper = new ObjectMapper();
  objectMapper.defaultStringifierContext.features.serialization.WRAP_ROOT_VALUE = true;
  objectMapper.defaultParserContext.features.deserialization.UNWRAP_ROOT_VALUE = true;

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"User":{"id":1,"email":"john.alfa@gmail.com"}}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
});

test('@JsonRootName with value', t => {
  @JsonRootName({value: 'userRoot'})
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;

    constructor(id: number, email: string) {
      this.id = id;
      this.email = email;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com');
  const objectMapper = new ObjectMapper();
  objectMapper.defaultStringifierContext.features.serialization.WRAP_ROOT_VALUE = true;
  objectMapper.defaultParserContext.features.deserialization.UNWRAP_ROOT_VALUE = true;

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"userRoot":{"id":1,"email":"john.alfa@gmail.com"}}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
});

test('Fail @JsonRootName on deserialization expecting root name "User"', t => {
  @JsonRootName()
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;

    constructor(id: number, email: string) {
      this.id = id;
      this.email = email;
    }
  }

  const objectMapper = new ObjectMapper();
  objectMapper.defaultParserContext.features.deserialization.UNWRAP_ROOT_VALUE = true;

  const err = t.throws<JacksonError>(() => {
    objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com"}', {mainCreator: () => [User]});
  });

  t.assert(err instanceof JacksonError);
});
