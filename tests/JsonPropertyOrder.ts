import test from 'ava';
import {JsonPropertyOrder} from '../src/decorators/JsonPropertyOrder';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

test('class without @JsonPropertyOrder', t => {
  class User {
    @JsonProperty()
    name: string;
    @JsonProperty()
    email: string;
    @JsonProperty()
    id: number;

    constructor(id: number, email: string, name: string) {
      this.id = id;
      this.email = email;
      this.name = name;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John Alfa');
  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","name":"John Alfa"}'));
});

test('class with @JsonPropertyOrder with value', t => {
  @JsonPropertyOrder({value: ['email', 'id', 'name']})
  class User {
    @JsonProperty()
    name: string;
    @JsonProperty()
    email: string;
    @JsonProperty()
    id: number;

    constructor(id: number, email: string, name: string) {
      this.id = id;
      this.email = email;
      this.name = name;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John Alfa');
  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(jsonData, '{"email":"john.alfa@gmail.com","id":1,"name":"John Alfa"}');
});

test('class with @JsonPropertyOrder with alphabetic order', t => {
  @JsonPropertyOrder({alphabetic: true})
  class User {
    @JsonProperty()
    name: string;
    @JsonProperty()
    email: string;
    @JsonProperty()
    id: number;

    constructor(id: number, email: string, name: string) {
      this.id = id;
      this.email = email;
      this.name = name;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John Alfa');
  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(jsonData, '{"email":"john.alfa@gmail.com","id":1,"name":"John Alfa"}');
});
