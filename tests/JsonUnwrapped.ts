import test from 'ava';
import {JsonClass} from '../src/annotations/JsonClass';
import {JsonUnwrapped} from '../src/annotations/JsonUnwrapped';
import {ObjectMapper} from '../src/databind/ObjectMapper';

test('@JsonUnwrapped', t => {
  class User {
    id: number;
    @JsonUnwrapped()
    @JsonClass({class: () => [Name]})
    name: Name;

    constructor(id: number, name: Name) {
      this.id = id;
      this.name = name;
    }

  }

  class Name {
    first: string;
    last: string;

    constructor(first: string, last: string) {
      this.first = first;
      this.last = last;
    }
  }

  const name = new Name('John', 'Alfa');
  const user = new User(1, name);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"id":1,"first":"John","last":"Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.name instanceof Name);
  t.is(userParsed.id, 1);
  t.is(userParsed.name.first, 'John');
  t.is(userParsed.name.last, 'Alfa');
});

test('@JsonUnwrapped with prefix', t => {
  class User {
    id: number;
    @JsonUnwrapped({prefix: 'parent-'})
    @JsonClass({class: () => [Name]})
    name: Name;

    constructor(id: number, name: Name) {
      this.id = id;
      this.name = name;
    }

  }

  class Name {
    first: string;
    last: string;

    constructor(first: string, last: string) {
      this.first = first;
      this.last = last;
    }
  }

  const name = new Name('John', 'Alfa');
  const user = new User(1, name);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"id":1,"parent-first":"John","parent-last":"Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.name instanceof Name);
  t.is(userParsed.id, 1);
  t.is(userParsed.name.first, 'John');
  t.is(userParsed.name.last, 'Alfa');
});

test('@JsonUnwrapped with suffix', t => {
  class User {
    id: number;
    @JsonUnwrapped({suffix: '-parent'})
    @JsonClass({class: () => [Name]})
    name: Name;

    constructor(id: number, name: Name) {
      this.id = id;
      this.name = name;
    }

  }

  class Name {
    first: string;
    last: string;

    constructor(first: string, last: string) {
      this.first = first;
      this.last = last;
    }
  }

  const name = new Name('John', 'Alfa');
  const user = new User(1, name);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"id":1,"first-parent":"John","last-parent":"Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.name instanceof Name);
  t.is(userParsed.id, 1);
  t.is(userParsed.name.first, 'John');
  t.is(userParsed.name.last, 'Alfa');
});

test('@JsonUnwrapped with prefix and suffix', t => {
  class User {
    id: number;
    @JsonUnwrapped({prefix: 'parentPrefix-', suffix: '-parentSuffix'})
    @JsonClass({class: () => [Name]})
    name: Name;

    constructor(id: number, name: Name) {
      this.id = id;
      this.name = name;
    }

  }

  class Name {
    first: string;
    last: string;

    constructor(first: string, last: string) {
      this.first = first;
      this.last = last;
    }
  }

  const name = new Name('John', 'Alfa');
  const user = new User(1, name);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"id":1,"parentPrefix-first-parentSuffix":"John","parentPrefix-last-parentSuffix":"Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.name instanceof Name);
  t.is(userParsed.id, 1);
  t.is(userParsed.name.first, 'John');
  t.is(userParsed.name.last, 'Alfa');
});
