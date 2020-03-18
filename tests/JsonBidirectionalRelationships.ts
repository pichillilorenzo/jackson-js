import test from 'ava';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JacksonError} from '../src/core/JacksonError';
import {JsonBackReference, JsonClass, JsonManagedReference} from '../src';

test('Fail Infinite recursion', t => {
  class User {
    id: number;
    email: string;
    firstname: string;
    lastname: string;

    @JsonClass({class: () => [Array, [Item]]})
    items: Item[] = [];

    constructor(id: number, email: string, firstname: string, lastname: string) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  class Item {
    id: number;
    name: string;

    @JsonClass({class: () => [User]})
    owner: User;

    constructor(id: number, name: string, owner: User) {
      this.id = id;
      this.name = name;
      this.owner = owner;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Book', user);
  const item2 = new Item(2, 'Computer', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const err = t.throws<JacksonError>(() => {
    objectMapper.stringify<User>(user);
  });

  t.assert(err instanceof JacksonError);
});

test('@JsonManagedReference And @JsonBackReference', t => {
  class User {
    id: number;
    email: string;
    firstname: string;
    lastname: string;

    @JsonClass({class: () => [Array, [Item]]})
    @JsonManagedReference()
    items: Item[] = [];

    constructor(id: number, email: string, firstname: string, lastname: string) {
      this.id = id;
      this.email = email;
      this.firstname = firstname;
      this.lastname = lastname;
    }
  }

  class Item {
    id: number;
    name: string;

    @JsonClass({class: () => [User]})
    @JsonBackReference()
    owner: User;

    constructor(id: number, name: string, owner: User) {
      this.id = id;
      this.name = name;
      this.owner = owner;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Book', user);
  const item2 = new Item(2, 'Computer', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();
  const jsonData = objectMapper.stringify<User>(user);

  t.assert(jsonData.includes('john.alfa@gmail.com'));
  t.assert(jsonData.includes('Book'));
  t.assert(jsonData.includes('Computer'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed.items.length === 2);
  t.assert(userParsed.items[0].owner === userParsed);
  t.assert(userParsed.items[1].owner === userParsed);
});