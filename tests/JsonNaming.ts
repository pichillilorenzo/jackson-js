import test from 'ava';
import {JsonNaming, PropertyNamingStrategy} from '../src/decorators/JsonNaming';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

test('@JsonNaming with JsonNamingStrategy.SNAKE_CASE', t => {
  @JsonNaming({strategy: PropertyNamingStrategy.SNAKE_CASE})
  class Book {
    @JsonProperty()
    id: number;
    @JsonProperty()
    bookName: string;
    @JsonProperty()
    bookCategory: string;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.bookName = name;
      this.bookCategory = category;
    }
  }

  const book = new Book(1, 'Learning TypeScript', 'Web Development');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Book>(book);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"book_name":"Learning TypeScript","book_category":"Web Development"}'));

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.LOWER_CASE', t => {
  @JsonNaming({strategy: PropertyNamingStrategy.LOWER_CASE})
  class Book {
    @JsonProperty()
    id: number;
    @JsonProperty()
    bookName: string;
    @JsonProperty()
    bookCategory: string;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.bookName = name;
      this.bookCategory = category;
    }
  }

  const book = new Book(1, 'Learning TypeScript', 'Web Development');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Book>(book);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"bookname":"Learning TypeScript","bookcategory":"Web Development"}'));

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.KEBAB_CASE', t => {
  @JsonNaming({strategy: PropertyNamingStrategy.KEBAB_CASE})
  class Book {
    @JsonProperty()
    id: number;
    @JsonProperty()
    bookName: string;
    @JsonProperty()
    bookCategory: string;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.bookName = name;
      this.bookCategory = category;
    }
  }

  const book = new Book(1, 'Learning TypeScript', 'Web Development');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Book>(book);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"book-name":"Learning TypeScript","book-category":"Web Development"}'));

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.LOWER_CAMEL_CASE', t => {
  @JsonNaming({strategy: PropertyNamingStrategy.LOWER_CAMEL_CASE})
  class Book {
    @JsonProperty()
    id: number;
    @JsonProperty()
    bookName: string;
    @JsonProperty()
    bookCategory: string;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.bookName = name;
      this.bookCategory = category;
    }
  }

  const book = new Book(1, 'Learning TypeScript', 'Web Development');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Book>(book);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"bookName":"Learning TypeScript","bookCategory":"Web Development"}'));

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.UPPER_CAMEL_CASE', t => {
  @JsonNaming({strategy: PropertyNamingStrategy.UPPER_CAMEL_CASE})
  class Book {
    @JsonProperty()
    id: number;
    @JsonProperty()
    bookName: string;
    @JsonProperty()
    bookCategory: string;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.bookName = name;
      this.bookCategory = category;
    }
  }

  const book = new Book(1, 'Learning TypeScript', 'Web Development');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Book>(book);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"Id":1,"BookName":"Learning TypeScript","BookCategory":"Web Development"}'));

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.LOWER_DOT_CASE', t => {
  @JsonNaming({strategy: PropertyNamingStrategy.LOWER_DOT_CASE})
  class Book {
    @JsonProperty()
    id: number;
    @JsonProperty()
    bookName: string;
    @JsonProperty()
    bookCategory: string;

    constructor(id: number, name: string, category: string) {
      this.id = id;
      this.bookName = name;
      this.bookCategory = category;
    }
  }

  const book = new Book(1, 'Learning TypeScript', 'Web Development');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Book>(book);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"book.name":"Learning TypeScript","book.category":"Web Development"}'));

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.SNAKE_CASE and @JsonProperty for a virtual property', t => {
  @JsonNaming({strategy: PropertyNamingStrategy.SNAKE_CASE})
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstName: string;
    @JsonProperty()
    lastName: string;

    constructor(id: number) {
      this.id = id;
    }

    @JsonProperty()
    getFullName(): string {
      return this.firstName + ' ' + this.lastName;
    }

    @JsonProperty()
    setFullName(fullName: string) {
      const fullNameSplitted = fullName.split(' ');
      this.firstName = fullNameSplitted[0];
      this.lastName = fullNameSplitted[1];
    }
  }

  const user = new User(1);
  user.firstName = 'John';
  user.lastName = 'Alfa';
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"first_name":"John","last_name":"Alfa","full_name":"John Alfa"}'));

  const userParsed = objectMapper.parse<User>('{"id":1,"full_name":"John Alfa"}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstName, 'John');
  t.is(userParsed.lastName, 'Alfa');
  t.assert(!Object.hasOwnProperty.call(userParsed, 'full_name'));
  t.assert(!Object.hasOwnProperty.call(userParsed, 'fullName'));
});

test('@JsonNaming with JsonNamingStrategy.SNAKE_CASE and @JsonProperty with value for a virtual property', t => {
  @JsonNaming({strategy: PropertyNamingStrategy.SNAKE_CASE})
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstName: string;
    @JsonProperty()
    lastName: string;

    constructor(id: number) {
      this.id = id;
    }

    @JsonProperty({value: 'myFullName'})
    getFullName(): string {
      return this.firstName + ' ' + this.lastName;
    }

    @JsonProperty({value: 'myFullName'})
    setFullName(fullName: string) {
      const fullNameSplitted = fullName.split(' ');
      this.firstName = fullNameSplitted[0];
      this.lastName = fullNameSplitted[1];
    }
  }

  const user = new User(1);
  user.firstName = 'John';
  user.lastName = 'Alfa';
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"first_name":"John","last_name":"Alfa","my_full_name":"John Alfa"}'));

  const userParsed = objectMapper.parse<User>('{"id":1,"my_full_name":"John Alfa"}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstName, 'John');
  t.is(userParsed.lastName, 'Alfa');
  t.assert(!Object.hasOwnProperty.call(userParsed, 'my_full_name'));
  t.assert(!Object.hasOwnProperty.call(userParsed, 'fullName'));
});
