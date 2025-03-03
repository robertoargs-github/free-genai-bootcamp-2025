class LanguageHelpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LanguageHelp' });
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background
        this.add.rectangle(0, 0, width, height, 0x1a1a2e)
            .setOrigin(0);
        
        // Add title
        this.add.text(width / 2, 50, 'Japanese Language Help', {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5, 0);
        
        // Create tabs for different language help sections
        this.createTabs();
        
        // Initial content - show basic phrases
        this.showBasicPhrases();
        
        // Back button
        const backButton = this.add.image(100, height - 50, 'button')
            .setDisplaySize(160, 50)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                backButton.setTexture('button-hover');
            })
            .on('pointerout', () => {
                backButton.setTexture('button');
            })
            .on('pointerdown', () => {
                try {
                    this.sound.play('click');
                } catch (e) {
                    console.warn('Click sound not available');
                }
                this.scene.start('Menu');
            });
            
        this.add.text(100, height - 50, 'Back to Menu', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
    
    createTabs() {
        const width = this.cameras.main.width;
        const tabY = 120;
        const tabWidth = 200;
        const tabHeight = 40;
        const tabSpacing = 10;
        
        // Tab style
        const tabStyle = {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        };
        
        // Content container - will hold the content for the selected tab
        this.contentContainer = this.add.container(0, 0);
        
        // Basic Phrases tab
        const basicPhrasesTab = this.add.rectangle(width / 2 - tabWidth - tabSpacing, tabY, tabWidth, tabHeight, 0x4a4e69)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                basicPhrasesTab.setFillStyle(0x5d6eaa);
            })
            .on('pointerout', () => {
                if (this.activeTab !== basicPhrasesTab) {
                    basicPhrasesTab.setFillStyle(0x4a4e69);
                }
            })
            .on('pointerdown', () => {
                try {
                    this.sound.play('click');
                } catch (e) {
                    console.warn('Click sound not available');
                }
                this.setActiveTab(basicPhrasesTab);
                this.showBasicPhrases();
            });
            
        this.add.text(width / 2 - tabWidth - tabSpacing, tabY, 'Basic Phrases', tabStyle)
            .setOrigin(0.5);
        
        // Grammar tab
        const grammarTab = this.add.rectangle(width / 2, tabY, tabWidth, tabHeight, 0x4a4e69)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                grammarTab.setFillStyle(0x5d6eaa);
            })
            .on('pointerout', () => {
                if (this.activeTab !== grammarTab) {
                    grammarTab.setFillStyle(0x4a4e69);
                }
            })
            .on('pointerdown', () => {
                try {
                    this.sound.play('click');
                } catch (e) {
                    console.warn('Click sound not available');
                }
                this.setActiveTab(grammarTab);
                this.showGrammar();
            });
            
        this.add.text(width / 2, tabY, 'Grammar Points', tabStyle)
            .setOrigin(0.5);
        
        // Vocabulary tab
        const vocabTab = this.add.rectangle(width / 2 + tabWidth + tabSpacing, tabY, tabWidth, tabHeight, 0x4a4e69)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                vocabTab.setFillStyle(0x5d6eaa);
            })
            .on('pointerout', () => {
                if (this.activeTab !== vocabTab) {
                    vocabTab.setFillStyle(0x4a4e69);
                }
            })
            .on('pointerdown', () => {
                try {
                    this.sound.play('click');
                } catch (e) {
                    console.warn('Click sound not available');
                }
                this.setActiveTab(vocabTab);
                this.showVocabulary();
            });
            
        this.add.text(width / 2 + tabWidth + tabSpacing, tabY, 'Vocabulary', tabStyle)
            .setOrigin(0.5);
        
        // Store tabs for reference
        this.tabs = [basicPhrasesTab, grammarTab, vocabTab];
        
        // Set initial active tab
        this.setActiveTab(basicPhrasesTab);
    }
    
    setActiveTab(activeTab) {
        // Store the active tab reference
        this.activeTab = activeTab;
        
        // Update tab appearances
        this.tabs.forEach(tab => {
            if (tab === activeTab) {
                tab.setFillStyle(0x7289DA); // Active tab color
            } else {
                tab.setFillStyle(0x4a4e69); // Inactive tab color
            }
        });
        
        // Clear content container
        this.contentContainer.removeAll(true);
    }
    
    showBasicPhrases() {
        const width = this.cameras.main.width;
        const startY = 180;
        const lineHeight = 40;
        
        // Title
        const title = this.add.text(width / 2, startY, 'Common Japanese Phrases', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        
        // Phrases table
        const phrases = [
            { japanese: 'こんにちは', romaji: 'Konnichiwa', english: 'Hello' },
            { japanese: 'おはようございます', romaji: 'Ohayou gozaimasu', english: 'Good morning' },
            { japanese: 'こんばんは', romaji: 'Konbanwa', english: 'Good evening' },
            { japanese: 'さようなら', romaji: 'Sayounara', english: 'Goodbye' },
            { japanese: 'ありがとうございます', romaji: 'Arigatou gozaimasu', english: 'Thank you' },
            { japanese: 'すみません', romaji: 'Sumimasen', english: 'Excuse me / I\'m sorry' },
            { japanese: 'はい', romaji: 'Hai', english: 'Yes' },
            { japanese: 'いいえ', romaji: 'Iie', english: 'No' },
            { japanese: 'お願いします', romaji: 'Onegaishimasu', english: 'Please' },
            { japanese: 'わかりました', romaji: 'Wakarimashita', english: 'I understand' },
            { japanese: 'わかりません', romaji: 'Wakarimasen', english: 'I don\'t understand' },
            { japanese: 'もう一度お願いします', romaji: 'Mou ichido onegaishimasu', english: 'Please say it again' }
        ];
        
        // Column headers
        const headerY = startY + 50;
        this.add.text(width / 4, headerY, 'Japanese', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        
        this.add.text(width / 2, headerY, 'Romaji', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        
        this.add.text(3 * width / 4, headerY, 'English', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        
        // Draw separator line
        const line = this.add.graphics();
        line.lineStyle(2, 0xffffff, 1);
        line.beginPath();
        line.moveTo(width / 8, headerY + 30);
        line.lineTo(7 * width / 8, headerY + 30);
        line.closePath();
        line.strokePath();
        
        // Add phrases
        phrases.forEach((phrase, index) => {
            const y = headerY + 50 + (index * lineHeight);
            
            this.add.text(width / 4, y, phrase.japanese, {
                fontFamily: 'Noto Sans JP',
                fontSize: '20px',
                color: '#ffffff'
            }).setOrigin(0.5, 0);
            
            this.add.text(width / 2, y, phrase.romaji, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#dddddd'
            }).setOrigin(0.5, 0);
            
            this.add.text(3 * width / 4, y, phrase.english, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#dddddd'
            }).setOrigin(0.5, 0);
        });
        
        // Add all elements to the content container
        this.contentContainer.add(title);
        this.contentContainer.add(line);
    }
    
    showGrammar() {
        const width = this.cameras.main.width;
        const startY = 180;
        
        // Title
        const title = this.add.text(width / 2, startY, 'Basic Japanese Grammar', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        
        // Grammar content
        const contentY = startY + 50;
        const contentWidth = width * 0.75;
        const contentX = width / 2 - contentWidth / 2;
        
        // Grammar points
        const grammarPoints = [
            {
                title: 'Basic Sentence Structure',
                explanation: 'Japanese follows Subject-Object-Verb order: 私はりんごを食べます (I apple eat)',
                example: '私は本を読みます。',
                translation: 'I read a book.'
            },
            {
                title: 'Particles',
                explanation: 'Particles mark the grammatical function of words:',
                examples: [
                    { particle: 'は (wa)', usage: 'Topic marker', example: '私は学生です。', translation: 'I am a student.' },
                    { particle: 'が (ga)', usage: 'Subject marker', example: '誰が来ましたか？', translation: 'Who came?' },
                    { particle: 'を (o)', usage: 'Object marker', example: '水を飲みます。', translation: 'I drink water.' },
                    { particle: 'に (ni)', usage: 'Direction/location', example: '学校に行きます。', translation: 'I go to school.' }
                ]
            },
            {
                title: 'Present Tense',
                explanation: 'For verbs ending in ます (masu):',
                examples: [
                    { form: 'Affirmative', example: '食べます', translation: 'I eat / will eat' },
                    { form: 'Negative', example: '食べません', translation: 'I don\'t eat / won\'t eat' }
                ]
            }
        ];
        
        let currentY = contentY;
        
        // Add grammar points
        grammarPoints.forEach(point => {
            // Add title
            this.add.text(contentX, currentY, point.title, {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#7289DA',
                fontStyle: 'bold'
            });
            currentY += 30;
            
            // Add explanation
            this.add.text(contentX, currentY, point.explanation, {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#ffffff'
            });
            currentY += 30;
            
            // Add examples if they exist
            if (point.example) {
                this.add.text(contentX + 20, currentY, point.example, {
                    fontFamily: 'Noto Sans JP',
                    fontSize: '18px',
                    color: '#ffffff'
                });
                currentY += 25;
                
                this.add.text(contentX + 20, currentY, point.translation, {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: '#dddddd',
                    fontStyle: 'italic'
                });
                currentY += 40;
            }
            
            // Add multiple examples if they exist
            if (point.examples) {
                point.examples.forEach(ex => {
                    if (ex.particle) {
                        this.add.text(contentX + 20, currentY, `${ex.particle} - ${ex.usage}`, {
                            fontFamily: 'Arial',
                            fontSize: '18px',
                            color: '#ffffff'
                        });
                        currentY += 25;
                    } else if (ex.form) {
                        this.add.text(contentX + 20, currentY, `${ex.form}: ${ex.example}`, {
                            fontFamily: 'Arial',
                            fontSize: '18px',
                            color: '#ffffff'
                        });
                        currentY += 25;
                    }
                    
                    this.add.text(contentX + 40, currentY, ex.example, {
                        fontFamily: 'Noto Sans JP',
                        fontSize: '18px',
                        color: '#ffffff'
                    });
                    currentY += 25;
                    
                    this.add.text(contentX + 40, currentY, ex.translation, {
                        fontFamily: 'Arial',
                        fontSize: '16px',
                        color: '#dddddd',
                        fontStyle: 'italic'
                    });
                    currentY += 30;
                });
            }
            
            // Add spacing between grammar points
            currentY += 20;
        });
        
        // Add all elements to the content container
        this.contentContainer.add(title);
    }
    
    showVocabulary() {
        const width = this.cameras.main.width;
        const startY = 180;
        
        // Title
        const title = this.add.text(width / 2, startY, 'Essential Vocabulary by Location', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        
        // Vocabulary by location
        const locations = [
            {
                name: 'Post Office',
                words: [
                    { japanese: '切手', romaji: 'kitte', english: 'stamp' },
                    { japanese: '封筒', romaji: 'fuutou', english: 'envelope' },
                    { japanese: '小包', romaji: 'kozutsumi', english: 'package' },
                    { japanese: '送る', romaji: 'okuru', english: 'to send' }
                ]
            },
            {
                name: 'Cafe',
                words: [
                    { japanese: 'コーヒー', romaji: 'koohii', english: 'coffee' },
                    { japanese: '紅茶', romaji: 'koucha', english: 'tea' },
                    { japanese: 'ケーキ', romaji: 'keeki', english: 'cake' },
                    { japanese: '注文する', romaji: 'chuumon suru', english: 'to order' }
                ]
            },
            {
                name: 'Classroom',
                words: [
                    { japanese: '先生', romaji: 'sensei', english: 'teacher' },
                    { japanese: '学生', romaji: 'gakusei', english: 'student' },
                    { japanese: '教科書', romaji: 'kyoukasho', english: 'textbook' },
                    { japanese: '勉強する', romaji: 'benkyou suru', english: 'to study' }
                ]
            }
        ];
        
        let currentY = startY + 50;
        const columnWidth = width / 3;
        
        // Add each location's vocabulary
        locations.forEach((location, locationIndex) => {
            // Calculate x position based on location index
            const x = (locationIndex % 3) * columnWidth + columnWidth / 2;
            
            // Reset Y for new row if needed
            if (locationIndex % 3 === 0 && locationIndex > 0) {
                currentY += 220; // Adjust based on how many words per location
            }
            
            let locationY = currentY;
            
            // Location name
            this.add.text(x, locationY, location.name, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#7289DA',
                fontStyle: 'bold'
            }).setOrigin(0.5, 0);
            locationY += 30;
            
            // Add words
            location.words.forEach(word => {
                this.add.text(x, locationY, word.japanese, {
                    fontFamily: 'Noto Sans JP',
                    fontSize: '18px',
                    color: '#ffffff'
                }).setOrigin(0.5, 0);
                locationY += 25;
                
                this.add.text(x, locationY, `${word.romaji} - ${word.english}`, {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: '#dddddd'
                }).setOrigin(0.5, 0);
                locationY += 30;
            });
        });
        
        // Add all elements to the content container
        this.contentContainer.add(title);
    }
}
