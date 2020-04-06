import test from 'ava';
import {JsonRootName} from '../src/decorators/JsonRootName';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

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

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"User":{"id":1,"email":"john.alfa@gmail.com"}}');

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

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"userRoot":{"id":1,"email":"john.alfa@gmail.com"}}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.email, 'john.alfa@gmail.com');
});
