# Lore Opposum

Good copy is good design, but until you’ve found the perfect copy, sometimes you need placeholder text to help you visualize the layout. [Lorem ipsum](http://en.wikipedia.org/wiki/Lorem_ipsum) gives you that. This is Lore Opossum (the autocorrected version of lorem ipsum), a content-first placeholder text generator with many flavors and a focus on ease of use.

## The State of Lorem Ipsum Generators

There are a lot of entertaining lorem ipsum generators out there, but they all seem to have some questionable unspoken rules. _Before_ you get content, you _must_…

- Select the number of paragraphs you want.
- Ask if you want to begin with “Lorem ipsum dolar init…” or equivalent.

Sometimes there are other options up front like if I want `<p>` tags included. I don’t know about you, but the first thing I really want to see is some goofy placeholder text that I can copy. I can tweak things later if needed.

There are other annoyances with these generators: tiny font sizes, ads, no easy way to copy to your clipboard, and mobile-unfriendly layouts. Some of these generators have an… inappropriate number of features: browser extensions, jQuery plugins, Wordpress plugins, APIs, and mobile apps, to name a few. There is a pleasant Rube Goldberg quality to these features, but I find them wildly overwrought for the most part.

## Enter Lore Opposum

So I made my own generator. I’m aware that this is just another generator in the sea of generators. That’s okay. It’ll be the one I use at least. It solves many of the problems I find with other generators. It…

- Gives you the content first. The first thing you see is three paragraphs of lorem ipsum text.
- Has easily accessible controls that you can tweak with a single click.
- Is set in a modern font and legible font size. That’s [FF Tisa](https://www.fontfont.com/fonts/tisa) if you are curious.
- Has multiple flavors including the traditional “Lorem Ipsum” plus “Trello”, “Skate”, “Hodor”, “Redacted”, and “HaXsSoR”. I work on [Trello](https://trello.com) so that text is something I’ll use for mockups. HaXsSoR might help you find [XSS](http://en.wikipedia.org/wiki/Cross-site_scripting) vulnerabilities in your HTML templates. You can use “Redacted” if you _really_ don’t care about the text. “Skate” and “Hodor” are just funny to me.
- Can be formatted in plain Text, HTML (wrapped in `<p>` tags), or [JSON](http://en.wikipedia.org/wiki/JSON).
- Remembers your settings the next time you come back or refresh. If you had one paragraph of skate text in JSON format, that’s what it will be when you come back.
- Has a “Copy to Clipboard” button. You can also use the “Cmd+C” keyboard shortcut at any time. It also copies them in plain text so you don’t have to worry about font sizes, line heights, or typefaces being carried over when you paste.

If you are curious about the code, the whole thing is on [Github](https://github.com/bobbygrace/lore-opossum). Enjoy!
