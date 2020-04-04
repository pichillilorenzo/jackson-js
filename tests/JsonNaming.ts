import test from 'ava';
import {JsonNaming, JsonNamingStrategy} from '../src/annotations/JsonNaming';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/annotations/JsonProperty';

test('@JsonNaming with JsonNamingStrategy.SNAKE_CASE', t => {
  @JsonNaming({strategy: JsonNamingStrategy.SNAKE_CASE})
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
  t.is(jsonData, '{"id":1,"book_name":"Learning TypeScript","book_category":"Web Development"}');

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.LOWER_CASE', t => {
  @JsonNaming({strategy: JsonNamingStrategy.LOWER_CASE})
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
  t.is(jsonData, '{"id":1,"bookname":"Learning TypeScript","bookcategory":"Web Development"}');

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.KEBAB_CASE', t => {
  @JsonNaming({strategy: JsonNamingStrategy.KEBAB_CASE})
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
  t.is(jsonData, '{"id":1,"book-name":"Learning TypeScript","book-category":"Web Development"}');

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.LOWER_CAMEL_CASE', t => {
  @JsonNaming({strategy: JsonNamingStrategy.LOWER_CAMEL_CASE})
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
  t.is(jsonData, '{"id":1,"bookName":"Learning TypeScript","bookCategory":"Web Development"}');

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.UPPER_CAMEL_CASE', t => {
  @JsonNaming({strategy: JsonNamingStrategy.UPPER_CAMEL_CASE})
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
  t.is(jsonData, '{"Id":1,"BookName":"Learning TypeScript","BookCategory":"Web Development"}');

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});

test('@JsonNaming with JsonNamingStrategy.LOWER_DOT_CASE', t => {
  @JsonNaming({strategy: JsonNamingStrategy.LOWER_DOT_CASE})
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
  t.is(jsonData, '{"id":1,"book.name":"Learning TypeScript","book.category":"Web Development"}');

  const bookParsed = objectMapper.parse<Book>(jsonData, {mainCreator: () => [Book]});
  t.assert(bookParsed instanceof Book);
  t.is(book.id, 1);
  t.is(book.bookName, 'Learning TypeScript');
  t.is(book.bookCategory, 'Web Development');
});
