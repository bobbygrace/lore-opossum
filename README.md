# Lore Opposum

Good copy is an integral part of good design. But until you’ve found the perfect copy, sometimes you need placeholder text to help you visualize the layout. [Lorem ipsum](http://en.wikipedia.org/wiki/Lorem_ipsum) gives you that. Lore Opossum (the autocorrected version of Lorem Ipsum) is a content-first, easy to use lorem opossum generator with many flavors.

## The unspoken rules of lorem ipsum generators.

There are a lot of entertaining lorem ipsum generators out there, but they all seem to have some questionable unspoken rules. _Before_ you get content, you _must_…

- Select the number of paragraphs you want.
- Ask if you want to begin with “Lorem ipsum dolar init…” or equivalent.

Sometimes there are other options up front, like if I want `<p>` tags included. I don’t know about you, but I find this super annoying. Just give me my goofy text and let me tweak things later if needed.

There are other annoyances with generators: tiny font sizes, ads, swag, no easy way to copy to a clipboard, and mobile-unfriendly layouts. Some of these generators have a grotesque number of features. Chrome extensions. jQuery plugins. Wordpress plugins. APIs. Mobile apps. There is a pleasant Rube Goldberg quality to these features, but I find them wildly overwrought for the most part. Is it really faster than copying and pasting text?

## Enter Lore Opposum

So I made my own generator. I’m aware that this is just another generator in the sea of generators, but it will be the one I use, thank you very much. It solves many of the problems I find with other generators. It…

- Gives you the content first. The first thing you see is three paragraphs of Lorem Ipsum.
- Has easily visible controls to the side that let you tweak with a single click.
- Has multiple flavors, including traditional “Lorem Ipsum” and “Trello”, “Skate”, “Hodor”, “Redacted”, and “HaXsSoR”.
- Remembers your settings the next time you come back or refresh.
- Has a “Copy to Clipboard” button that copies in very plain, non-rich text. “Cmd+C” also works.

Why did I choose those particular flavors? “Lorem Ipsum” should be obvious. The [Trello](https://trello.com) ipsum is something I’ll use for mockups and is the closest thing you are going to get to an ad. HaXsSoR might help you find [XSS](http://en.wikipedia.org/wiki/Cross-site_scripting) vulnerabilities. You can use “Redacted” if you _really_ don’t care about the text. “Skate” and “Hodor” are just funny to me.

If you were looking for an API, I’m sorry, but I won’t be making one and also are you serious? The whole thing is on [Github](https://github.com/bobbygrace/lore-opossum). It is released under the MIT license so do whatever you want with it. Enjoy!

# TODO

- A real favicon.
- Controls for mobile
- Store show shortcut hints in localstorage
- Drop underline for "or use cmd+c" and make button more obvious.
- Add this explainer to the page.
