import test from 'ava';
import {JsonPropertyOrder} from '../src/decorators/JsonPropertyOrder';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonRootName} from '../src/decorators/JsonRootName';
import {JsonClass} from '../src/decorators/JsonClass';
import {JsonGetter} from '../src/decorators/JsonGetter';

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

test('@JsonPropertyOrder at class level with value', t => {
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
  t.is(jsonData, '{"email":"john.alfa@gmail.com","id":1,"name":"John Alfa"}');
});

test('@JsonPropertyOrder at class level with partial order', t => {
  @JsonPropertyOrder({value: ['email', 'lastname']})
  class User {
    @JsonProperty()
    email: string;
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;

    constructor(id: number, email: string, firstname: string, lastname: string) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<User>(user);
  t.assert(jsonData.startsWith('{"email":"john.alfa@gmail.com","lastname":"Alfa",'));
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"email":"john.alfa@gmail.com","lastname":"Alfa","id":1,"firstname":"John"}'));
});

test('@JsonPropertyOrder at class level with alphabetic order', t => {
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
  t.is(jsonData, '{"email":"john.alfa@gmail.com","id":1,"name":"John Alfa"}');
});

test('@JsonPropertyOrder at class level with value and alphabetic order', t => {
  @JsonPropertyOrder({value: ['name'], alphabetic: true})
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;
    @JsonProperty()
    email: string;

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

test('@JsonPropertyOrder at class level with value and @JsonRootName', t => {
  @JsonRootName()
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
  objectMapper.features.serialization.WRAP_ROOT_VALUE = true;
  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"User":{"email":"john.alfa@gmail.com","id":1,"name":"John Alfa"}}');
});

test('@JsonPropertyOrder at property level on Array', t => {
  class Book {
    @JsonProperty()
    name: string;
    @JsonProperty()
    category: string;
    @JsonProperty()
    id: number;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.name = name;
      this.category = category;
    }
  }

  class Writer {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonPropertyOrder({value: ['category', 'id', 'name']})
    @JsonClass({class: () => [Array, [Book]]})
    books: Book[] = [];

    constructor(id: number, name: string, @JsonClass({class: () => [Array, [Book]]}) books: Book[]) {
      this.id = id;
      this.name = name;
      this.books = books;
    }
  }

  const book = new Book(42, 'Learning TypeScript', 'Web Development');
  const writer = new Writer(1, 'John', [book]);

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Writer>(writer);
  t.assert(jsonData.includes('[{"category":"Web Development","id":42,"name":"Learning TypeScript"}]'));
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"name":"John","books":[{"category":"Web Development","id":42,"name":"Learning TypeScript"}]}'));
});

test('@JsonPropertyOrder at property level on Map', t => {
  class Book {
    @JsonProperty()
    name: string;
    @JsonProperty()
    category: string;
    @JsonProperty()
    id: number;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.name = name;
      this.category = category;
    }
  }

  class Writer {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonClass({class: () => [Map, [String, Book]]})
    @JsonPropertyOrder({value: ['category', 'id', 'name']})
    bookMap: Map<string, Book> = new Map<string, Book>();

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
    }
  }

  const book1 = new Book(42, 'Learning TypeScript', 'Web Development');
  const book2 = new Book(21, 'Learning Spring', 'Java');
  const writer = new Writer(1, 'John');
  writer.bookMap.set('book 2', book2);
  writer.bookMap.set('book 1', book1);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Writer>(writer);
  // eslint-disable-next-line max-len
  t.assert(jsonData.includes('{"book 2":{"category":"Java","id":21,"name":"Learning Spring"},"book 1":{"category":"Web Development","id":42,"name":"Learning TypeScript"}}'));
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"bookMap":{"book 2":{"category":"Java","id":21,"name":"Learning Spring"},"book 1":{"category":"Web Development","id":42,"name":"Learning TypeScript"}},"id":1,"name":"John"}'));
});


test('@JsonPropertyOrder at method level', t => {
  class Book {
    @JsonProperty()
    name: string;
    @JsonProperty()
    category: string;
    @JsonProperty()
    id: number;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.name = name;
      this.category = category;
    }
  }

  class Writer {
    @JsonProperty()
    id: number;
    @JsonProperty()
    name: string;

    @JsonProperty()
    @JsonClass({class: () => [Array, [Book]]})
    books: Book[] = [];

    constructor(id: number, name: string, @JsonClass({class: () => [Array, [Book]]}) books: Book[]) {
      this.id = id;
      this.name = name;
      this.books = books;
    }

    @JsonGetter()
    @JsonPropertyOrder({value: ['category', 'id', 'name']})
    @JsonClass({class: () => [Array, [Book]]})
    getBooks(): Book[] {
      return this.books;
    }
  }

  const book = new Book(42, 'Learning TypeScript', 'Web Development');
  const writer = new Writer(1, 'John', [book]);

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<Writer>(writer);
  t.assert(jsonData.includes('[{"category":"Web Development","id":42,"name":"Learning TypeScript"}]'));
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"name":"John","books":[{"category":"Web Development","id":42,"name":"Learning TypeScript"}]}'));
});
