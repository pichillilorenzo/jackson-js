import test from 'ava';
import {JsonPropertyOrder} from '../src/annotations/JsonPropertyOrder';
import {ObjectMapper} from '../src/databind/ObjectMapper';

test('class without @JsonPropertyOrder', t => {
  class User {
    name: string;
    email: string;
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
  t.is(jsonData, '{"name":"John Alfa","email":"john.alfa@gmail.com","id":1}');
});

test('class with @JsonPropertyOrder with value', t => {
  @JsonPropertyOrder({value: ['id', 'email', 'name']})
  class User {
    name: string;
    email: string;
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
  t.is(jsonData, '{"id":1,"email":"john.alfa@gmail.com","name":"John Alfa"}');
});

test('class with @JsonPropertyOrder with alphabetic order', t => {
  @JsonPropertyOrder({alphabetic: true})
  class User {
    name: string;
    email: string;
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
  t.is(jsonData, '{"email":"john.alfa@gmail.com","id":1,"name":"John Alfa"}');
});
