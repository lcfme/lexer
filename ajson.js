function Lexer(input = '') {
  this.input = input;
  this.ch = '';
  this.pos = -1;
  this.quoteStack = [];
  this.readChar();
}

Lexer.prototype.readChar = function() {
  if (this.pos < this.input.length) {
    this.ch = this.input[++this.pos] || null;
  }
  return this.ch;
};

Lexer.prototype.lookHead = function(k = 1) {
  var pos = this.pos + k;
  if (!this.input[pos]) {
    return null;
  }
  return this.input[pos];
};

Lexer.prototype.nextToken = function(fn) {
  var token;
  this.skipWhitespace();
  switch (this.ch) {
    case null:
      token = new Token({
        type: Token.Types.EOF,
        literal: null
      });
      break;
    case '{':
      token = new Token({
        type: Token.Types.LBRACE,
        literal: this.ch
      });
      break;
    case '}':
      token = new Token({
        type: Token.Types.RBRACE,
        literal: this.ch
      });
      break;

    case '[':
      token = new Token({
        type: Token.Types.LBRACKET,
        literal: this.ch
      });
      break;

    case ']':
      token = new Token({
        type: Token.Types.RBRACKET,
        literal: this.ch
      });
      break;

    case ',':
      token = new Token({
        type: Token.Types.COMMA,
        literal: this.ch
      });
      break;

    case '"':
    case "'":
      var startSign = this.ch;
      var val = '';
      var ch;
      while (
        (ch = this.readChar()) &&
        !(ch === startSign && this.lookHead(-1) !== '\\')
      ) {
        val += ch;
      }
      token = new Token({
        type: Token.Types.STR,
        literal: val
      });
      break;

    case ':':
      token = new Token({
        type: Token.Types.COLON,
        literal: this.ch
      });
      break;
    default:
      if (/\d/.test(this.ch)) {
        var val = this.ch;
        var hasDot = false;
        var ch;
        while ((ch = this.readChar()) && /[\d.]/.test(ch)) {
          if (ch === '.') {
            if (hasDot) {
              token = new Token({
                type: Token.Types.ILLEGAL,
                literal: ch
              });
              break;
            } else {
              hasDot = true;
              val += ch;
            }
          } else {
            val += ch;
          }
        }
        token = new Token({
          type: Token.Types.NUM,
          literal: val
        });
      } else if (/\w/.test(this.ch)) {
        var val = this.ch;
        while ((ch = this.readChar()) && /\w/.test(ch)) {
          val += ch;
        }
        var tokenType;
        if ((tokenType = Token.Keywords[val])) {
          token = new Token({
            type: tokenType,
            literal: val
          });
        } else {
          token = new Token({
            type: Token.Types.ILLEGAL,
            literal: this.ch
          });
        }
      } else {
        token = new Token({
          type: Token.Types.ILLEGAL,
          literal: this.ch
        });
      }
  }
  this.readChar();
  return token;
};

Lexer.prototype.skipWhitespace = function() {
  while (/\s/.test(this.ch)) {
    this.readChar();
  }
};

Lexer.prototype.tokenize = function() {
  var tokens = [];
  var token;
  var EOF = false;
  while (!EOF && (token = this.nextToken())) {
    tokens.push(token);
    if (token.type === Token.Types.EOF) {
      EOF = true;
    }
  }
  return tokens;
};

Lexer.Tokenize = function(input = '') {
  return new Lexer(input).tokenize();
};

function Token({ type, literal }) {
  this.type = type;
  this.literal = literal;
}

Token.Types = {
  EOF: null,
  LBRACE: '{',
  RBRACE: '}',
  LBRACKET: '[',
  RBRACKET: ']',
  COMMA: ',',
  COLON: ':',
  ILLEGAL: 'illegal',
  STR: 'str',
  NUM: 'num',
  TRUE: 'true',
  FALSE: 'false',
  NULL: 'null'
};

Token.Keywords = {
  true: Token.Types.TRUE,
  false: Token.Types.FALSE,
  null: Token.Types.NULL
};
