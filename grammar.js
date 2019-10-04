'use strict';

function optseq() {
  return optional(prec.left(seq.apply(null, arguments)));
}

function repseq() {
  return repeat(prec.left(seq.apply(null, arguments)));
}

function sep1(separator, rule) {
  return prec.left(seq(
    rule,
    repeat(prec.left(seq(separator, rule)))
  ));
}

const rules = {

  source_file: $ => $.value_change_dump_definitions,

  value_change_dump_definitions: $ => seq(
    repeat1($.declaration_command),
    seq('$enddefinitions', '$end'),
    repeat1($.simulation_command)
  ),

  declaration_command: $ => choice(
    seq('$comment', /[^$]*/, '$end'),
    seq('$date', /[^$]*/, '$end'),
    seq('$scope', optseq($.scope_type, $.scope_identifier), '$end'),
    seq('$timescale', optseq($.time_number, $.time_unit), '$end'),
    seq('$upscope', '$end'),
    seq('$var', optseq($.var_type, $.size, $.identifier_code, $.reference), '$end'),
    seq('$version', /[^$]*/, '$end')
  ),

  simulation_command: $ => choice(
    seq('$dumpall', repeat($.value_change), '$end'),
    seq('$dumpoff', repeat($.value_change), '$end'),
    seq('$dumpon', repeat($.value_change), '$end'),
    seq('$dumpvars', repeat($.value_change), '$end'),
    seq('$comment', /.*/, '$end'),
    $.simulation_time,
    $.value_change
  ),

  scope_type: $ => choice('begin', 'fork', 'function', 'module', 'task'),

  time_number: $ => choice('1', '10', '100'),

  time_unit: $ => choice('s', 'ms', 'us', 'ns', 'ps', 'fs'),

  var_type: $ => choice(
    'event', 'integer', 'parameter', 'real', 'realtime', 'reg', 'supply0', 'supply1', 'time',
    'tri', 'triand', 'trior', 'trireg', 'tri0', 'tri1', 'wand', 'wire', 'wor'
  ),

  simulation_time: $ => seq('#', $.decimal_number),

  value_change: $ => choice(
    $.scalar_value_change,
    $.vector_value_change
  ),

  scalar_value_change: $ => seq($.value, $.identifier_code),

  value: $ => /[01xXzZ]/,

  vector_value_change: $ => choice(
    seq(/[bB]/, $.binary_number, $.identifier_code),
    seq(/[rR]/, $.real_number, $.identifier_code)
  ),

  identifier_code: $ => /[!-~]+/,

  size: $ => $.decimal_number,

  reference: $ => seq(
    $.identifier,
    optional(choice(
      seq('[', $._bit_select_index, ']'),
      seq('[', $._msb_index, ':', $._lsb_index, ']')
    ))
  ),

  index: $ => $.decimal_number,

  _bit_select_index: $ => $.index,
  _msb_index: $ => $.index,
  _lsb_index: $ => $.index,

  scope_identifier: $ => /[a-zA-Z0-9_$]+/,
  comment_text: $ => /.*/,
  date_text: $ => /.*/,
  version_text: $ => /.*/,
  system_task: $ => /\$.*/,

  decimal_number: $ => token(/[0-9]+/),

  binary_number: $ => token(/[01xz]+/),

  real_number: $ => token(/[0-9][0-9_]*\.[0-9][0-9_]*/), // %.16g printf() format.  64-bit IEEE 754 double-precision number

  identifier: $ => /[!-~]+/

};

module.exports = grammar({
  name: 'vcd',
  rules: rules,
  extras: $ => [/\s/],
  externals: $ => []
});

/* eslint camelcase: 0 */
/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */
